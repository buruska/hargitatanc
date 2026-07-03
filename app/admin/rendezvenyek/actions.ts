"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type EventFormState = {
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

async function createUniqueSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let index = 2;

  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
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
