"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export type DocumentUploadState = {
  error?: string;
  success?: boolean;
  message?: string;
};

const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "documents");
const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".odt",
  ".ods",
]);

export async function uploadDocumentsAction(
  _state: DocumentUploadState,
  formData: FormData,
): Promise<DocumentUploadState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const document = formData.get("document");

  if (!title) {
    return { error: "Add meg a dokumentum nevét." };
  }

  if (title.length > 160) {
    return { error: "A dokumentum neve legfeljebb 160 karakter lehet." };
  }

  if (!(document instanceof File) || document.size === 0) {
    return { error: "Válassz ki egy dokumentumot." };
  }

  const extension = path.extname(document.name).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return { error: `Nem támogatott fájltípus: ${document.name}` };
  }

  if (document.size > MAX_DOCUMENT_SIZE) {
    return { error: `A(z) ${document.name} nagyobb a megengedett 20 MB-nál.` };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const id = randomUUID();
  const storedName = `${id}${extension}`;
  const filePath = path.join(UPLOAD_DIR, storedName);

  await writeFile(filePath, Buffer.from(await document.arrayBuffer()), { flag: "wx" });

  try {
    await writeFile(
      path.join(UPLOAD_DIR, `${id}.metadata.json`),
      JSON.stringify({ title, originalFileName: document.name, storedName, uploadedAt: new Date().toISOString() }),
      { encoding: "utf8", flag: "wx" },
    );
  } catch (error) {
    await unlink(filePath).catch(() => undefined);
    throw error;
  }

  revalidatePath("/admin/dokumentumok");

  return {
    success: true,
    message: "A dokumentum sikeresen feltöltve.",
  };
}
