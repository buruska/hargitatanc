"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { hasRichTextContent, sanitizeRichText } from "@/lib/sanitize-rich-text";
import { parseEventDateTime } from "@/lib/event-date-time";

export type EventFormState = {
  error?: string;
  success?: boolean;
};

export type DeleteEventState = {
  error?: string;
  success?: boolean;
};

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "events");

function getDateTime(formData: FormData, prefix: "start" | "end") {
  const year = Number(formData.get(`${prefix}DateYear`));
  const month = Number(formData.get(`${prefix}DateMonth`));
  const day = Number(formData.get(`${prefix}DateDay`));
  const hour = Number(formData.get(`${prefix}TimeHour`));
  const minute = Number(formData.get(`${prefix}TimeMinute`));

  if (![year, month, day, hour, minute].every(Number.isInteger)) return null;
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return parseEventDateTime({ day, hour, minute, month, year });
}

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
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const summary = sanitizeRichText(String(formData.get("summary") ?? ""));
  const coverImage = formData.get("coverImage");
  const hasEnd = String(formData.get("hasEnd") ?? "") === "true";

  if (!title || !hasRichTextContent(summary)) {
    return { error: "Tölts ki minden mezőt a rendezvény hozzáadásához." };
  }

  if (!(coverImage instanceof File) || coverImage.size === 0) {
    return { error: "Tölts fel borítóképet a rendezvényhez." };
  }

  if (!coverImage.type.startsWith("image/")) {
    return { error: "A borítókép csak képfájl lehet." };
  }

  if (coverImage.size > MAX_IMAGE_SIZE) {
    return { error: "A borítókép legfeljebb 8 MB lehet." };
  }

  const startsAt = getDateTime(formData, "start");
  const endsAt = hasEnd ? getDateTime(formData, "end") : null;

  if (!startsAt || (hasEnd && !endsAt)) {
    return { error: "Érvénytelen kezdési vagy vége időpont." };
  }

  if (endsAt && endsAt <= startsAt) {
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
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = sanitizeRichText(String(formData.get("summary") ?? ""));
  const coverImage = formData.get("coverImage");
  const hasEnd = String(formData.get("hasEnd") ?? "") === "true";

  if (!id) {
    return { error: "Hiányzik a módosítandó rendezvény azonosítója." };
  }

  if (!title || !hasRichTextContent(summary)) {
    return { error: "Tölts ki minden mezőt a rendezvény módosításához." };
  }

  const startsAt = getDateTime(formData, "start");
  const endsAt = hasEnd ? getDateTime(formData, "end") : null;

  if (!startsAt || (hasEnd && !endsAt)) {
    return { error: "Érvénytelen kezdési vagy vége időpont." };
  }

  if (endsAt && endsAt <= startsAt) {
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
  let newCoverImageUrl: string | null = null;

  if (coverImage instanceof File && coverImage.size > 0) {
    if (!coverImage.type.startsWith("image/")) {
      return { error: "A borítókép csak képfájl lehet." };
    }

    if (coverImage.size > MAX_IMAGE_SIZE) {
      return { error: "A borítókép legfeljebb 8 MB lehet." };
    }

    newCoverImageUrl = await saveCoverImage(coverImage, slug);
    coverImageUrl = newCoverImageUrl;
  }

  try {
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
  } catch (error) {
    // The database still references the previous cover, so only the newly
    // uploaded, otherwise orphaned file may be removed after a failed update.
    await deleteCoverImage(newCoverImageUrl);
    throw error;
  }

  if (newCoverImageUrl) {
    await deleteCoverImage(event.coverImageUrl);
  }

  revalidatePath("/");
  revalidatePath("/admin/rendezvenyek");
  revalidatePath("/esemenyeink");

  return { success: true };
}

export async function deleteEventAction(_state: DeleteEventState, formData: FormData): Promise<DeleteEventState> {
  await requireAdmin();
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
