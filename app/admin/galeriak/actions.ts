"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type DeleteGalleryState = {
  error?: string;
  success?: boolean;
};

export type EditGalleryState = DeleteGalleryState;
export type DeleteGalleryImageState = DeleteGalleryState;
export type CreateGalleryState = DeleteGalleryState;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_GALLERY_UPLOAD_SIZE = 40 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "performances");

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `galeria-${randomUUID().slice(0, 8)}`;
}

async function createUniqueSlug(title: string, currentId: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let index = 2;

  while (true) {
    const existing = await prisma.runningPerformance.findUnique({ where: { slug } });

    if (!existing || existing.id === currentId) return slug;
    slug = `${baseSlug}-${index++}`;
  }
}

function getImageExtension(file: File) {
  const extension = path.extname(file.name).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(extension) ? extension : ".jpg";
}

async function saveGalleryImage(file: File, slug: string, index: number) {
  const fileName = `${slug}-galeria-${index + 1}-${randomUUID()}${getImageExtension(file)}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/performances/${fileName}`;
}

export async function createPerformanceGalleryAction(
  _state: CreateGalleryState,
  formData: FormData,
): Promise<CreateGalleryState> {
  const title = String(formData.get("title") ?? "").trim();
  const coverImageIndex = Number.parseInt(String(formData.get("coverImageIndex") ?? ""), 10);
  const images = formData
    .getAll("galleryImages")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!title) return { error: "Add meg a galéria címét." };
  if (images.length === 0) return { error: "Válassz ki legalább egy képet." };
  if (!Number.isInteger(coverImageIndex) || coverImageIndex < 0 || coverImageIndex >= images.length) {
    return { error: "Válaszd ki a galéria borítóképét." };
  }
  if (images.some((file) => !file.type.startsWith("image/"))) return { error: "Csak képfájl tölthető fel." };
  if (images.some((file) => file.size > MAX_IMAGE_SIZE)) return { error: "Egy kép legfeljebb 5 MB lehet." };
  if (images.reduce((total, file) => total + file.size, 0) > MAX_GALLERY_UPLOAD_SIZE) {
    return { error: "A kiválasztott képek összmérete legfeljebb 40 MB lehet." };
  }

  const temporaryId = randomUUID();
  const slug = await createUniqueSlug(title, temporaryId);
  const imageUrls = await Promise.all(images.map((file, index) => saveGalleryImage(file, slug, index)));
  await prisma.$transaction([
    prisma.runningPerformance.updateMany({
      where: { galleryIsPublished: true, galleryImages: { some: {} } },
      data: { gallerySortOrder: { increment: 1 } },
    }),
    prisma.runningPerformance.create({
      data: {
        title,
        slug,
        summary: "",
        isGalleryOnly: true,
        coverImageUrl: imageUrls[coverImageIndex],
        gallerySortOrder: 0,
        galleryImages: {
          create: imageUrls.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
        },
      },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");
  return { success: true };
}

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

export async function updatePerformanceGalleryAction(
  _state: EditGalleryState,
  formData: FormData,
): Promise<EditGalleryState> {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const coverImageId = String(formData.get("coverImageId") ?? "").trim();
  const newImages = formData
    .getAll("galleryImages")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!id || !title) return { error: "Add meg a galéria címét." };
  if (newImages.some((file) => !file.type.startsWith("image/"))) return { error: "Csak képfájl tölthető fel." };
  if (newImages.some((file) => file.size > MAX_IMAGE_SIZE)) return { error: "Egy kép legfeljebb 5 MB lehet." };
  if (newImages.reduce((total, file) => total + file.size, 0) > MAX_GALLERY_UPLOAD_SIZE) {
    return { error: "A kiválasztott képek összmérete legfeljebb 40 MB lehet." };
  }

  const gallery = await prisma.runningPerformance.findUnique({
    where: { id },
    select: { coverImageUrl: true, galleryImages: { orderBy: { sortOrder: "asc" } } },
  });
  if (!gallery) return { error: "A galéria már nem található." };

  const selectedCover = gallery.galleryImages.find((image) => image.id === coverImageId);
  if (!selectedCover) return { error: "Válassz borítóképet a galéria képei közül." };

  const slug = await createUniqueSlug(title, id);
  const imageUrls = await Promise.all(
    newImages.map((file, index) => saveGalleryImage(file, slug, gallery.galleryImages.length + index)),
  );

  await prisma.$transaction([
    prisma.runningPerformance.update({
      where: { id },
      data: { title, slug, coverImageUrl: selectedCover.imageUrl },
    }),
    ...imageUrls.map((imageUrl, index) => prisma.runningPerformanceGalleryImage.create({
      data: { runningPerformanceId: id, imageUrl, sortOrder: gallery.galleryImages.length + index },
    })),
  ]);

  const oldCoverIsGalleryImage = gallery.galleryImages.some((image) => image.imageUrl === gallery.coverImageUrl);
  if (!oldCoverIsGalleryImage && gallery.coverImageUrl !== selectedCover.imageUrl) {
    await deleteGalleryFile(gallery.coverImageUrl);
  }

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");
  return { success: true };
}

export async function deleteGalleryImageAction(
  _state: DeleteGalleryImageState,
  formData: FormData,
): Promise<DeleteGalleryImageState> {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Hiányzik a kép azonosítója." };

  const image = await prisma.runningPerformanceGalleryImage.findUnique({
    where: { id },
    select: {
      imageUrl: true,
      runningPerformance: {
        select: { id: true, coverImageUrl: true, galleryImages: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
      },
    },
  });
  if (!image) return { error: "A kép már nem található." };
  if (image.runningPerformance.galleryImages.length <= 1) return { error: "A galéria utolsó képe nem törölhető." };

  const replacement = image.runningPerformance.galleryImages.find((item) => item.id !== id);
  await prisma.$transaction([
    ...(image.runningPerformance.coverImageUrl === image.imageUrl && replacement
      ? [prisma.runningPerformance.update({ where: { id: image.runningPerformance.id }, data: { coverImageUrl: replacement.imageUrl } })]
      : []),
    prisma.runningPerformanceGalleryImage.delete({ where: { id } }),
  ]);
  await deleteGalleryFile(image.imageUrl);

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");
  return { success: true };
}

export async function toggleGalleryPublicationAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const galleryIsPublished = String(formData.get("galleryIsPublished") ?? "") === "true";

  if (!id) {
    return;
  }

  const gallerySortOrder = await prisma.runningPerformance.count({
    where: {
      galleryIsPublished,
      galleryImages: { some: {} },
      NOT: { id },
    },
  });

  await prisma.runningPerformance.update({
    data: {
      galleryIsPublished,
      gallerySortOrder,
    },
    where: {
      id,
    },
  });

  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
}

export async function movePerformanceGalleryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();
  if (!id || !["up", "down"].includes(direction)) return;

  const current = await prisma.runningPerformance.findUnique({
    where: { id },
    select: { galleryIsPublished: true },
  });
  if (!current) return;

  const galleries = await prisma.runningPerformance.findMany({
    where: {
      galleryIsPublished: current.galleryIsPublished,
      galleryImages: { some: {} },
    },
    orderBy: [{ gallerySortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  const currentIndex = galleries.findIndex((gallery) => gallery.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= galleries.length) return;

  const reordered = [...galleries];
  const [moved] = reordered.splice(currentIndex, 1);
  if (!moved) return;
  reordered.splice(targetIndex, 0, moved);

  await prisma.$transaction(reordered.map((gallery, gallerySortOrder) =>
    prisma.runningPerformance.update({ where: { id: gallery.id }, data: { gallerySortOrder } }),
  ));
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
      coverImageUrl: true,
      isGalleryOnly: true,
      galleryImages: {
        select: {
          imageUrl: true,
        },
      },
      _count: {
        select: {
          events: true,
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

  const isStandaloneGallery = performance.isGalleryOnly && performance._count.events === 0;

  if (isStandaloneGallery) {
    await prisma.runningPerformance.delete({ where: { id } });
    const imageUrls = new Set([
      performance.coverImageUrl,
      ...performance.galleryImages.map((galleryImage) => galleryImage.imageUrl),
    ]);
    await Promise.all(Array.from(imageUrls, (imageUrl) => deleteGalleryFile(imageUrl)));
  } else {
    await prisma.runningPerformanceGalleryImage.deleteMany({
      where: {
        runningPerformanceId: id,
      },
    });
    await Promise.all(
      performance.galleryImages
        .filter((galleryImage) => galleryImage.imageUrl !== performance.coverImageUrl)
        .map((galleryImage) => deleteGalleryFile(galleryImage.imageUrl)),
    );
  }

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}
