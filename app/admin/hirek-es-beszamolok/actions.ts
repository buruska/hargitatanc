"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type NewsPostFormState = {
  error?: string;
  success?: boolean;
};

export type DeleteNewsPostState = {
  error?: string;
  success?: boolean;
};

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `hir-${randomUUID().slice(0, 8)}`;
}

async function createUniqueSlug(title: string, currentId?: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let index = 2;

  while (true) {
    const existingPost = await prisma.newsPost.findUnique({ where: { slug } });

    if (!existingPost || existingPost.id === currentId) {
      return slug;
    }

    slug = `${baseSlug}-${index}`;
    index += 1;
  }
}

function revalidateNewsPaths() {
  revalidatePath("/admin/hirek-es-beszamolok");
  revalidatePath("/hirek");
}

export async function updateNewsPostAction(_state: NewsPostFormState, formData: FormData): Promise<NewsPostFormState> {
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const publishedAtValue = String(formData.get("publishedAt") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const publishedAt = new Date(publishedAtValue);

  if (!id) {
    return { error: "Hiányzik a módosítandó hír azonosítója." };
  }

  if (!title) {
    return { error: "Add meg a hír címét." };
  }

  if (!publishedAtValue || Number.isNaN(publishedAt.getTime())) {
    return { error: "Adj meg érvényes dátumot." };
  }

  if (!excerpt) {
    return { error: "Add meg a helyszínt vagy rövid összefoglalót." };
  }

  if (!content || content === "<p></p>") {
    return { error: "Írd meg a hír szövegét." };
  }

  const existingPost = await prisma.newsPost.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existingPost) {
    return { error: "A hír már nem található." };
  }

  const slug = await createUniqueSlug(title, id);

  await prisma.newsPost.update({
    where: {
      id,
    },
    data: {
      title,
      slug,
      excerpt,
      content,
      publishedAt,
    },
  });

  revalidateNewsPaths();

  return { success: true };
}

export async function deleteNewsPostAction(_state: DeleteNewsPostState, formData: FormData): Promise<DeleteNewsPostState> {
  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { error: "Hiányzik a törlendő hír azonosítója." };
  }

  const existingPost = await prisma.newsPost.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existingPost) {
    return { error: "A hír már nem található." };
  }

  await prisma.newsPost.delete({
    where: {
      id,
    },
  });

  revalidateNewsPaths();

  return { success: true };
}

export async function moveNewsPostAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();

  if (!id || !["up", "down"].includes(direction)) {
    return;
  }

  const posts = await prisma.newsPost.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    select: {
      id: true,
      publishedAt: true,
    },
  });
  const currentIndex = posts.findIndex((post) => post.id === id);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  const currentPost = posts[currentIndex];
  const targetPost = posts[targetIndex];

  if (!currentPost || !targetPost) {
    return;
  }

  await prisma.$transaction([
    prisma.newsPost.update({
      where: {
        id: currentPost.id,
      },
      data: {
        publishedAt: targetPost.publishedAt,
      },
    }),
    prisma.newsPost.update({
      where: {
        id: targetPost.id,
      },
      data: {
        publishedAt: currentPost.publishedAt,
      },
    }),
  ]);

  revalidateNewsPaths();
}
