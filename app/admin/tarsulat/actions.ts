"use server";

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "company");

export type GroupImageFormState = {
  message: string;
  status: "idle" | "error" | "success";
};

export type IntroTextFormState = {
  message: string;
  status: "idle" | "error" | "success";
};

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

async function saveGroupImage(groupImage: File) {
  const extension = getImageExtension(groupImage);
  const fileName = `csoportkep-${randomUUID()}${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const groupImageUrl = `/uploads/company/${fileName}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(filePath, Buffer.from(await groupImage.arrayBuffer()));

  return groupImageUrl;
}

async function deleteGroupImage(groupImageUrl: string | null) {
  if (!groupImageUrl?.startsWith("/uploads/company/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", groupImageUrl.replace(/^\//, ""));

  try {
    await unlink(filePath);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code !== "ENOENT") {
      throw error;
    }
  }
}

export async function uploadGroupImageAction(
  _state: GroupImageFormState,
  formData: FormData,
): Promise<GroupImageFormState> {
  const groupImage = formData.get("groupImage");

  if (!(groupImage instanceof File) || groupImage.size === 0) {
    return { message: "Válassz ki egy csoportképet.", status: "error" };
  }

  if (!groupImage.type.startsWith("image/")) {
    return { message: "Csak képfájl tölthető fel.", status: "error" };
  }

  if (groupImage.size > MAX_IMAGE_SIZE) {
    return { message: "A kép legfeljebb 5 MB lehet.", status: "error" };
  }

  const currentProfile = await prisma.companyProfile.findUnique({
    select: {
      groupImageUrl: true,
    },
    where: {
      id: "main",
    },
  });
  const groupImageUrl = await saveGroupImage(groupImage);

  await prisma.companyProfile.upsert({
    create: {
      groupImageUrl,
      id: "main",
    },
    update: {
      groupImageUrl,
    },
    where: {
      id: "main",
    },
  });
  await deleteGroupImage(currentProfile?.groupImageUrl ?? null);

  revalidatePath("/admin/tarsulat");
  revalidatePath("/tarsulat");

  return { message: "A csoportkép feltöltve.", status: "success" };
}

export async function updateIntroTextAction(
  _state: IntroTextFormState,
  formData: FormData,
): Promise<IntroTextFormState> {
  const introText = String(formData.get("introText") ?? "").trim();

  if (!introText || introText === "<p></p>") {
    return { message: "Add meg a bemutató szöveget.", status: "error" };
  }

  await prisma.companyProfile.upsert({
    create: {
      id: "main",
      introText,
    },
    update: {
      introText,
    },
    where: {
      id: "main",
    },
  });

  revalidatePath("/admin/tarsulat");
  revalidatePath("/tarsulat");

  return { message: "A bemutató szöveg mentve.", status: "success" };
}
