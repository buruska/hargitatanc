"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type EventFormState = {
  error?: string;
  success?: boolean;
};

export type DeleteEventState = {
  error?: string;
  success?: boolean;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "events");

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `rendezveny-${randomUUID().slice(0, 8)}`;
}

async function createUniqueSlug(title: string, currentId?: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let index = 2;

  while (true) {
    const existingEvent = await prisma.event.findUnique({ where: { slug } });

    if (!existingEvent || existingEvent.id === currentId) {
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
  const coverImageUrl = `/uploads/events/${fileName}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(filePath, Buffer.from(await coverImage.arrayBuffer()));

  return coverImageUrl;
}

async function deleteCoverImage(coverImageUrl: string | null) {
  if (!coverImageUrl?.startsWith("/uploads/events/")) {
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

export async function createEventAction(_state: EventFormState, formData: FormData): Promise<EventFormState> {
  const title = String(formData.get("title") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const coverImage = formData.get("coverImage");

  if (!title || !startDate || !startTime || !endDate || !endTime || !summary) {
    return { error: "Tölts ki minden mezőt a rendezvény hozzáadásához." };
  }

  if (!(coverImage instanceof File) || coverImage.size === 0) {
    return { error: "Tölts fel borítóképet a rendezvényhez." };
  }

  if (!coverImage.type.startsWith("image/")) {
    return { error: "A borítókép csak képfájl lehet." };
  }

  if (coverImage.size > MAX_IMAGE_SIZE) {
    return { error: "A borítókép legfeljebb 5 MB lehet." };
  }

  const startsAt = new Date(`${startDate}T${startTime}:00`);
  const endsAt = new Date(`${endDate}T${endTime}:00`);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: "Érvénytelen kezdési vagy vége időpont." };
  }

  if (endsAt <= startsAt) {
    return { error: "A vége időpont későbbi kell legyen, mint a kezdési időpont." };
  }

  const slug = await createUniqueSlug(title);
  const coverImageUrl = await saveCoverImage(coverImage, slug);

  await prisma.event.create({
    data: {
      title,
      slug,
      startsAt,
      endsAt,
      location: "",
      summary,
      coverImageUrl,
    },
  });

  revalidatePath("/admin/rendezvenyek");
  revalidatePath("/esemenyeink");

  return { success: true };
}

export async function updateEventAction(_state: EventFormState, formData: FormData): Promise<EventFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const coverImage = formData.get("coverImage");

  if (!id) {
    return { error: "Hiányzik a módosítandó rendezvény azonosítója." };
  }

  if (!title || !startDate || !startTime || !endDate || !endTime || !summary) {
    return { error: "Tölts ki minden mezőt a rendezvény módosításához." };
  }

  const startsAt = new Date(`${startDate}T${startTime}:00`);
  const endsAt = new Date(`${endDate}T${endTime}:00`);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { error: "Érvénytelen kezdési vagy vége időpont." };
  }

  if (endsAt <= startsAt) {
    return { error: "A vége időpont későbbi kell legyen, mint a kezdési időpont." };
  }

  const event = await prisma.event.findUnique({
    where: {
      id,
    },
    select: {
      coverImageUrl: true,
    },
  });

  if (!event) {
    return { error: "A rendezvény már nem található." };
  }

  const slug = await createUniqueSlug(title, id);
  let coverImageUrl = event.coverImageUrl;

  if (coverImage instanceof File && coverImage.size > 0) {
    if (!coverImage.type.startsWith("image/")) {
      return { error: "A borítókép csak képfájl lehet." };
    }

    if (coverImage.size > MAX_IMAGE_SIZE) {
      return { error: "A borítókép legfeljebb 5 MB lehet." };
    }

    coverImageUrl = await saveCoverImage(coverImage, slug);
    await deleteCoverImage(event.coverImageUrl);
  }

  await prisma.event.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      startsAt,
      endsAt,
      summary,
      coverImageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/rendezvenyek");
  revalidatePath("/esemenyeink");

  return { success: true };
}

export async function deleteEventAction(_state: DeleteEventState, formData: FormData): Promise<DeleteEventState> {
  try {
    const id = String(formData.get("id") ?? "").trim();

    if (!id) {
      return { error: "Hiányzik a törlendő rendezvény azonosítója." };
    }

    const event = await prisma.event.findUnique({
      where: {
        id,
      },
      select: {
        coverImageUrl: true,
      },
    });

    if (!event) {
      return { error: "A rendezvény már nem található." };
    }

    await prisma.event.delete({
      where: {
        id,
      },
    });

    await deleteCoverImage(event.coverImageUrl);

    revalidatePath("/");
    revalidatePath("/admin/rendezvenyek");
    revalidatePath("/esemenyeink");

    return { success: true };
  } catch (error) {
    console.error(error);

    return { error: "A rendezvény törlése nem sikerült. Próbáld újra később." };
  }
}
