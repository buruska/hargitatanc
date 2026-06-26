"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PerformanceFormState = {
  error?: string;
  success?: boolean;
};

export type DeletePerformanceState = {
  error?: string;
  success?: boolean;
};

export type PerformanceEventFormState = {
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

  const slug = await createUniqueSlug(title);
  const coverImageUrl = await saveCoverImage(coverImage, slug);

  await prisma.runningPerformance.create({
    data: {
      title,
      slug,
      summary,
      coverImageUrl,
    },
  });

  revalidatePath("/admin/futo-eloadasok");

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
  revalidatePath("/admin/futo-eloadasok");

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

  revalidatePath("/");
  revalidatePath("/admin/futo-eloadasok");

  return { success: true };
}

export async function createRunningPerformanceEventAction(
  _state: PerformanceEventFormState,
  formData: FormData,
): Promise<PerformanceEventFormState> {
  const runningPerformanceId = String(formData.get("runningPerformanceId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const ticketUrl = String(formData.get("ticketUrl") ?? "").trim();

  if (!runningPerformanceId) {
    return { error: "Hiányzik az előadás azonosítója." };
  }

  if (!date || !time || !location || !ticketUrl) {
    return { error: "Tölts ki minden mezőt a fellépés hozzáadásához." };
  }

  const startsAt = new Date(`${date}T${time}:00`);

  if (Number.isNaN(startsAt.getTime())) {
    return { error: "Érvénytelen dátum vagy kezdési időpont." };
  }

  try {
    new URL(ticketUrl);
  } catch {
    return { error: "Adj meg érvényes jegyvásárló linket." };
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
      ticketUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/futo-eloadasok");

  return { success: true };
}
