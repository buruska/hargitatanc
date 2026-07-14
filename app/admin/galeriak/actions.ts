"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type DeleteGalleryState = {
  error?: string;
  success?: boolean;
};

async function deleteGalleryFile(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/performances/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));

  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

export async function toggleGalleryPublicationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const galleryIsPublished = String(formData.get("galleryIsPublished") ?? "") === "true";

  if (!id) {
    return;
  }

  await prisma.runningPerformance.update({
    data: {
      galleryIsPublished,
    },
    where: {
      id,
    },
  });

  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
}

export async function deletePerformanceGalleryAction(
  _state: DeleteGalleryState,
  formData: FormData,
): Promise<DeleteGalleryState> {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Hiányzik a galéria azonosítója." };
  }

  const performance = await prisma.runningPerformance.findUnique({
    select: {
      galleryImages: {
        select: {
          imageUrl: true,
        },
      },
    },
    where: {
      id,
    },
  });

  if (!performance) {
    return { error: "A galéria már nem található." };
  }

  await prisma.runningPerformanceGalleryImage.deleteMany({
    where: {
      runningPerformanceId: id,
    },
  });

  await Promise.all(performance.galleryImages.map((galleryImage) => deleteGalleryFile(galleryImage.imageUrl)));

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}
