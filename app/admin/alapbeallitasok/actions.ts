"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type DefaultCoverFormState = {
  error?: string;
  success?: boolean;
};

export type DeleteDefaultCoverState = {
  error?: string;
  success?: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "default-covers");

function getImageExtension(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension)) {
    return extension;
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  if (file.type === "image/gif") {
    return ".gif";
  }

  return ".jpg";
}

async function deleteDefaultCoverFile(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/default-covers/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));

  try {
    await unlink(filePath);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code !== "ENOENT") {
      console.error(error);
    }
  }
}

export async function uploadDefaultCoverAction(
  _state: DefaultCoverFormState,
  formData: FormData,
): Promise<DefaultCoverFormState> {
  const coverImages = formData
    .getAll("coverImages")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (coverImages.length === 0) {
    return { error: "Tölts fel legalább egy alap borítóképet." };
  }

  const invalidFile = coverImages.find((coverImage) => !coverImage.type.startsWith("image/"));

  if (invalidFile) {
    return { error: "Az alap borítóképek csak képfájlok lehetnek." };
  }

  const oversizedFile = coverImages.find((coverImage) => coverImage.size > MAX_IMAGE_SIZE);

  if (oversizedFile) {
    return { error: "Egy alap borítókép legfeljebb 5 MB lehet." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const lastCoverImage = await prisma.defaultCoverImage.findFirst({
    orderBy: {
      sortOrder: "desc",
    },
    select: {
      sortOrder: true,
    },
  });
  const firstSortOrder = (lastCoverImage?.sortOrder ?? -1) + 1;

  const uploadedImages = await Promise.all(
    coverImages.map(async (coverImage, index) => {
      const extension = getImageExtension(coverImage);
      const fileName = `alap-borito-${randomUUID()}${extension}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      const imageUrl = `/uploads/default-covers/${fileName}`;

      await writeFile(filePath, Buffer.from(await coverImage.arrayBuffer()));

      return { imageUrl, sortOrder: firstSortOrder + index };
    }),
  );

  await prisma.defaultCoverImage.createMany({
    data: uploadedImages,
  });

  revalidatePath("/");
  revalidatePath("/admin/alapbeallitasok");

  return { success: true };
}

export async function deleteDefaultCoverAction(
  _state: DeleteDefaultCoverState,
  formData: FormData,
): Promise<DeleteDefaultCoverState> {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Hiányzik a törlendő kép azonosítója." };
  }

  const coverImage = await prisma.defaultCoverImage.findUnique({
    where: {
      id,
    },
  });

  if (!coverImage) {
    return { error: "Az alap borítókép már nem található." };
  }

  await prisma.defaultCoverImage.delete({
    where: {
      id,
    },
  });

  await deleteDefaultCoverFile(coverImage.imageUrl);

  revalidatePath("/");
  revalidatePath("/admin/alapbeallitasok");

  return { success: true };
}

export async function moveDefaultCoverAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();

  if (!id || !["up", "down"].includes(direction)) {
    return;
  }

  const coverImages = await prisma.defaultCoverImage.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
  const currentIndex = coverImages.findIndex((coverImage) => coverImage.id === id);

  if (currentIndex < 0) {
    return;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= coverImages.length) {
    return;
  }

  const reorderedCoverImages = [...coverImages];
  const [movedCoverImage] = reorderedCoverImages.splice(currentIndex, 1);

  if (!movedCoverImage) {
    return;
  }

  reorderedCoverImages.splice(targetIndex, 0, movedCoverImage);

  await prisma.$transaction(
    reorderedCoverImages.map((coverImage, sortOrder) =>
      prisma.defaultCoverImage.update({
        where: {
          id: coverImage.id,
        },
        data: {
          sortOrder,
        },
      }),
    ),
  );

  revalidatePath("/");
  revalidatePath("/admin/alapbeallitasok");
}
