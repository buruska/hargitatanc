"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ticketModeValues, type TicketMode } from "@/lib/tickets";

export type PerformanceFormState = {
  error?: string;
  success?: boolean;
};

export type DeletePerformanceState = {
  error?: string;
  success?: boolean;
};

export type DeleteGalleryImageState = {
  error?: string;
  success?: boolean;
};

export type AddGalleryImagesState = {
  error?: string;
  success?: boolean;
};

export type PerformanceEventFormState = {
  error?: string;
  success?: boolean;
};

export type PerformanceNewsFormState = {
  error?: string;
  success?: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "performances");

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `eloadas-${randomUUID().slice(0, 8)}`;
}

async function createUniqueSlug(title: string, currentId?: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let index = 2;

  while (true) {
    const existingPerformance = await prisma.runningPerformance.findUnique({ where: { slug } });

    if (!existingPerformance || existingPerformance.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;
    index += 1;
  }
}

async function createUniqueNewsSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let index = 2;

  while (await prisma.newsPost.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

function getTicketFields(formData: FormData): { ticketMode: TicketMode; ticketText: string; ticketUrl: string } | { error: string } {
  const rawTicketMode = String(formData.get("ticketMode") ?? "LINK").trim();
  const ticketMode = ticketModeValues.includes(rawTicketMode as TicketMode) ? (rawTicketMode as TicketMode) : "LINK";
  const ticketUrl = String(formData.get("ticketUrl") ?? "").trim();
  const ticketText = String(formData.get("ticketText") ?? "").trim();

  if (ticketMode === "LINK") {
    if (!ticketUrl) {
      return { error: "Add meg a jegyvásárló linket." };
    }

    try {
      new URL(ticketUrl);
    } catch {
      return { error: "Adj meg érvényes jegyvásárló linket." };
    }

    return { ticketMode, ticketText: "", ticketUrl };
  }

  if (ticketMode === "CUSTOM") {
    if (!ticketText) {
      return { error: "Add meg az egyéb jegyinformáció szövegét." };
    }

    return { ticketMode, ticketText, ticketUrl: "" };
  }

  return { ticketMode, ticketText: "", ticketUrl: "" };
}

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

async function saveCoverImage(coverImage: File, slug: string) {
  const extension = getImageExtension(coverImage);
  const fileName = `${slug}-${randomUUID()}${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const coverImageUrl = `/uploads/performances/${fileName}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(filePath, Buffer.from(await coverImage.arrayBuffer()));

  return coverImageUrl;
}

async function saveGalleryImage(galleryImage: File, slug: string, index: number) {
  const extension = getImageExtension(galleryImage);
  const fileName = `${slug}-galeria-${index + 1}-${randomUUID()}${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  const imageUrl = `/uploads/performances/${fileName}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(filePath, Buffer.from(await galleryImage.arrayBuffer()));

  return imageUrl;
}

async function deleteCoverImage(coverImageUrl: string) {
  if (!coverImageUrl.startsWith("/uploads/performances/")) {
    return;
  }

  const filePath = path.join(process.cwd(), "public", coverImageUrl.replace(/^\//, ""));

  try {
    await unlink(filePath);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code !== "ENOENT") {
      console.error(error);
    }
  }
}

export async function createRunningPerformanceAction(
  _state: PerformanceFormState,
  formData: FormData,
): Promise<PerformanceFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const coverImage = formData.get("coverImage");
  const galleryImages = formData
    .getAll("galleryImages")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!title || !summary) {
    return { error: "Add meg az előadás címét és rövid leírását." };
  }

  if (!(coverImage instanceof File) || coverImage.size === 0) {
    return { error: "Tölts fel borítóképet az előadáshoz." };
  }

  if (!coverImage.type.startsWith("image/")) {
    return { error: "A borítókép csak képfájl lehet." };
  }

  if (coverImage.size > MAX_IMAGE_SIZE) {
    return { error: "A borítókép legfeljebb 5 MB lehet." };
  }

  const invalidGalleryImage = galleryImages.find((galleryImage) => !galleryImage.type.startsWith("image/"));

  if (invalidGalleryImage) {
    return { error: "A galéria képei csak képfájlok lehetnek." };
  }

  const oversizedGalleryImage = galleryImages.find((galleryImage) => galleryImage.size > MAX_IMAGE_SIZE);

  if (oversizedGalleryImage) {
    return { error: "Egy galériakép legfeljebb 5 MB lehet." };
  }

  const slug = await createUniqueSlug(title);
  const coverImageUrl = await saveCoverImage(coverImage, slug);
  const galleryImageUrls = await Promise.all(
    galleryImages.map((galleryImage, index) => saveGalleryImage(galleryImage, slug, index)),
  );

  await prisma.runningPerformance.create({
    data: {
      title,
      slug,
      summary,
      isGalleryOnly: false,
      coverImageUrl,
      galleryImages: {
        create: galleryImageUrls.map((imageUrl, sortOrder) => ({
          imageUrl,
          sortOrder,
        })),
      },
    },
  });

  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function updateRunningPerformanceAction(
  _state: PerformanceFormState,
  formData: FormData,
): Promise<PerformanceFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const coverImage = formData.get("coverImage");

  if (!id) {
    return { error: "Hiányzik a módosítandó előadás azonosítója." };
  }

  if (!title || !summary) {
    return { error: "Add meg az előadás címét és rövid leírását." };
  }

  const performance = await prisma.runningPerformance.findUnique({
    where: {
      id,
    },
    select: {
      coverImageUrl: true,
      galleryImages: {
        select: {
          imageUrl: true,
        },
      },
    },
  });

  if (!performance) {
    return { error: "Az előadás már nem található." };
  }

  let coverImageUrl = performance.coverImageUrl;
  const slug = await createUniqueSlug(title, id);

  if (coverImage instanceof File && coverImage.size > 0) {
    if (!coverImage.type.startsWith("image/")) {
      return { error: "A borítókép csak képfájl lehet." };
    }

    if (coverImage.size > MAX_IMAGE_SIZE) {
      return { error: "A borítókép legfeljebb 5 MB lehet." };
    }

    coverImageUrl = await saveCoverImage(coverImage, slug);
    await deleteCoverImage(performance.coverImageUrl);
  }

  await prisma.runningPerformance.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      summary,
      coverImageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function deleteRunningPerformanceAction(
  _state: DeletePerformanceState,
  formData: FormData,
): Promise<DeletePerformanceState> {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Hiányzik a törlendő előadás azonosítója." };
  }

  const performance = await prisma.runningPerformance.findUnique({
    where: {
      id,
    },
    select: {
      coverImageUrl: true,
      galleryImages: {
        select: {
          imageUrl: true,
        },
      },
    },
  });

  if (!performance) {
    return { error: "Az előadás már nem található." };
  }

  await prisma.runningPerformance.delete({
    where: {
      id,
    },
  });

  await deleteCoverImage(performance.coverImageUrl);
  await Promise.all(performance.galleryImages.map((galleryImage) => deleteCoverImage(galleryImage.imageUrl)));

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function deleteRunningPerformanceGalleryImageAction(
  _state: DeleteGalleryImageState,
  formData: FormData,
): Promise<DeleteGalleryImageState> {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Hiányzik a törlendő kép azonosítója." };
  }

  const galleryImage = await prisma.runningPerformanceGalleryImage.findUnique({
    where: {
      id,
    },
    select: {
      imageUrl: true,
    },
  });

  if (!galleryImage) {
    return { error: "A kép már nem található." };
  }

  await prisma.runningPerformanceGalleryImage.delete({
    where: {
      id,
    },
  });

  await deleteCoverImage(galleryImage.imageUrl);

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function addRunningPerformanceGalleryImagesAction(
  _state: AddGalleryImagesState,
  formData: FormData,
): Promise<AddGalleryImagesState> {
  const runningPerformanceId = String(formData.get("runningPerformanceId") ?? "").trim();
  const galleryImages = formData
    .getAll("galleryImages")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!runningPerformanceId) {
    return { error: "Hiányzik az előadás azonosítója." };
  }

  if (galleryImages.length === 0) {
    return { error: "Válassz ki legalább egy képet." };
  }

  const invalidGalleryImage = galleryImages.find((galleryImage) => !galleryImage.type.startsWith("image/"));

  if (invalidGalleryImage) {
    return { error: "A galéria képei csak képfájlok lehetnek." };
  }

  const oversizedGalleryImage = galleryImages.find((galleryImage) => galleryImage.size > MAX_IMAGE_SIZE);

  if (oversizedGalleryImage) {
    return { error: "Egy galériakép legfeljebb 5 MB lehet." };
  }

  const performance = await prisma.runningPerformance.findUnique({
    where: {
      id: runningPerformanceId,
    },
    select: {
      slug: true,
      _count: {
        select: {
          galleryImages: true,
        },
      },
    },
  });

  if (!performance) {
    return { error: "Az előadás már nem található." };
  }

  const galleryImageUrls = await Promise.all(
    galleryImages.map((galleryImage, index) =>
      saveGalleryImage(galleryImage, performance.slug, performance._count.galleryImages + index),
    ),
  );

  await prisma.runningPerformanceGalleryImage.createMany({
    data: galleryImageUrls.map((imageUrl, index) => ({
      runningPerformanceId,
      imageUrl,
      sortOrder: performance._count.galleryImages + index,
    })),
  });

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function moveRunningPerformanceGalleryImageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();
  const runningPerformanceId = String(formData.get("runningPerformanceId") ?? "").trim();

  if (!id || !runningPerformanceId || !["up", "down"].includes(direction)) {
    return;
  }

  const galleryImages = await prisma.runningPerformanceGalleryImage.findMany({
    where: {
      runningPerformanceId,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
  const currentIndex = galleryImages.findIndex((galleryImage) => galleryImage.id === id);

  if (currentIndex < 0) {
    return;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= galleryImages.length) {
    return;
  }

  const reorderedGalleryImages = [...galleryImages];
  const [movedGalleryImage] = reorderedGalleryImages.splice(currentIndex, 1);

  if (!movedGalleryImage) {
    return;
  }

  reorderedGalleryImages.splice(targetIndex, 0, movedGalleryImage);

  await prisma.$transaction(
    reorderedGalleryImages.map((galleryImage, sortOrder) =>
      prisma.runningPerformanceGalleryImage.update({
        where: {
          id: galleryImage.id,
        },
        data: {
          sortOrder,
        },
      }),
    ),
  );

  revalidatePath("/");
  revalidatePath("/galeria");
  revalidatePath("/admin/galeriak");
  revalidatePath("/admin/jatszott-darabok");
}

export async function createRunningPerformanceEventAction(
  _state: PerformanceEventFormState,
  formData: FormData,
): Promise<PerformanceEventFormState> {
  const runningPerformanceId = String(formData.get("runningPerformanceId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const ticketFields = getTicketFields(formData);

  if (!runningPerformanceId) {
    return { error: "Hiányzik az előadás azonosítója." };
  }

  if (!location) {
    return { error: "Helyszín megadása kötelező." };
  }

  if (!date || !time) {
    return { error: "Tölts ki minden mezőt a fellépés hozzáadásához." };
  }

  const startsAt = new Date(`${date}T${time}:00`);

  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Érvénytelen dátum vagy kezdési időpont." };
  }

  if ("error" in ticketFields) {
    return ticketFields;
  }

  const performance = await prisma.runningPerformance.findUnique({
    where: {
      id: runningPerformanceId,
    },
    select: {
      id: true,
    },
  });

  if (!performance) {
    return { error: "Az előadás már nem található." };
  }

  await prisma.runningPerformanceEvent.create({
    data: {
      runningPerformanceId,
      startsAt,
      location,
      ticketMode: ticketFields.ticketMode,
      ticketText: ticketFields.ticketText,
      ticketUrl: ticketFields.ticketUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function updateRunningPerformanceEventAction(
  _state: PerformanceEventFormState,
  formData: FormData,
): Promise<PerformanceEventFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const ticketFields = getTicketFields(formData);

  if (!id) {
    return { error: "Hiányzik a módosítandó fellépés azonosítója." };
  }

  if (!location) {
    return { error: "Helyszín megadása kötelező." };
  }

  if (!date || !time) {
    return { error: "Tölts ki minden mezőt a fellépés módosításához." };
  }

  const startsAt = new Date(`${date}T${time}:00`);

  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Érvénytelen dátum vagy kezdési időpont." };
  }

  if ("error" in ticketFields) {
    return ticketFields;
  }

  const event = await prisma.runningPerformanceEvent.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!event) {
    return { error: "A fellépés már nem található." };
  }

  await prisma.runningPerformanceEvent.update({
    where: {
      id,
    },
    data: {
      startsAt,
      location,
      ticketMode: ticketFields.ticketMode,
      ticketText: ticketFields.ticketText,
      ticketUrl: ticketFields.ticketUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function deleteRunningPerformanceEventAction(
  _state: DeletePerformanceState,
  formData: FormData,
): Promise<DeletePerformanceState> {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Hiányzik a törlendő fellépés azonosítója." };
  }

  const event = await prisma.runningPerformanceEvent.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!event) {
    return { error: "A fellépés már nem található." };
  }

  await prisma.runningPerformanceEvent.delete({
    where: {
      id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/jatszott-darabok");

  return { success: true };
}

export async function createPerformanceNewsAction(
  _state: PerformanceNewsFormState,
  formData: FormData,
): Promise<PerformanceNewsFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const startsAtValue = String(formData.get("startsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const startsAt = new Date(startsAtValue);

  if (!title) {
    return { error: "Add meg a hír címét." };
  }

  if (!startsAtValue || Number.isNaN(startsAt.getTime())) {
    return { error: "Hiányzik vagy érvénytelen a fellépés dátuma." };
  }

  if (!location) {
    return { error: "Hiányzik a fellépés helyszíne." };
  }

  if (!content || content === "<p></p>") {
    return { error: "Írd meg a hír szövegét a mentéshez." };
  }

  const slug = await createUniqueNewsSlug(title);
  const excerpt = location;
  const contentWithDefaultCover = coverImageUrl ? `<img src="${coverImageUrl}" alt="">${content}` : content;

  await prisma.newsPost.create({
    data: {
      title,
      slug,
      excerpt,
      content: contentWithDefaultCover,
      publishedAt: startsAt,
    },
  });

  revalidatePath("/admin/hirek-es-beszamolok");
  revalidatePath("/hirek");

  return { success: true };
}
