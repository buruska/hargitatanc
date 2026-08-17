"use server";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { recordFileAudit } from "@/lib/prisma";

export type DocumentUploadState = {
  error?: string;
  success?: boolean;
  message?: string;
};

type DocumentMetadata = {
  title: string;
  originalFileName: string;
  storedName: string;
  uploadedAt: string;
  sortOrder?: number;
  metadataPath: string;
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

function isSafeStoredName(storedName: string) {
  return storedName === path.basename(storedName) && !storedName.endsWith(".metadata.json");
}

async function getDocumentRecords(): Promise<DocumentMetadata[]> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
  const metadataByFile = new Map<string, DocumentMetadata>();

  await Promise.all(entries.filter((entry) => entry.isFile() && entry.name.endsWith(".metadata.json")).map(async (entry) => {
    try {
      const metadataPath = path.join(UPLOAD_DIR, entry.name);
      const item = JSON.parse(await readFile(metadataPath, "utf8")) as Omit<DocumentMetadata, "metadataPath">;
      metadataByFile.set(item.storedName, { ...item, metadataPath });
    } catch {
      // A sérült metaadatfájl nem akadályozhatja a dokumentumkezelést.
    }
  }));

  const documents = await Promise.all(entries.filter((entry) => entry.isFile() && !entry.name.endsWith(".metadata.json")).map(async (entry) => {
    const existing = metadataByFile.get(entry.name);
    if (existing) return existing;

    const fileStat = await stat(path.join(UPLOAD_DIR, entry.name));
    const separator = entry.name.indexOf("--");
    return {
      title: separator === -1 ? entry.name : entry.name.slice(separator + 2),
      originalFileName: entry.name,
      storedName: entry.name,
      uploadedAt: fileStat.birthtime.toISOString(),
      metadataPath: path.join(UPLOAD_DIR, `${entry.name}.metadata.json`),
    };
  }));

  return documents.sort((a, b) => {
    if (a.sortOrder !== undefined || b.sortOrder !== undefined) {
      return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
    }
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });
}

async function saveMetadata(document: DocumentMetadata, sortOrder = document.sortOrder) {
  const { metadataPath, ...metadata } = document;
  await writeFile(metadataPath, JSON.stringify({ ...metadata, sortOrder }), "utf8");
}

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
      JSON.stringify({ title, originalFileName: document.name, storedName, uploadedAt: new Date().toISOString(), sortOrder: -Date.now() }),
      { encoding: "utf8", flag: "wx" },
    );
  } catch (error) {
    await unlink(filePath).catch(() => undefined);
    throw error;
  }

  revalidatePath("/admin/dokumentumok");
  await recordFileAudit("CREATE", "Document", title);

  return {
    success: true,
    message: "A dokumentum sikeresen feltöltve.",
  };
}

export async function renameDocumentAction(formData: FormData) {
  await requireAdmin();
  const storedName = String(formData.get("storedName") ?? "");
  const title = String(formData.get("title") ?? "").trim();

  if (!isSafeStoredName(storedName) || !title || title.length > 160) return;

  const documents = await getDocumentRecords();
  const document = documents.find((item) => item.storedName === storedName);
  if (!document) return;

  await saveMetadata({ ...document, title });
  await recordFileAudit("UPDATE", "Document", title);
  revalidatePath("/admin/dokumentumok");
}

export async function deleteDocumentAction(formData: FormData) {
  await requireAdmin();
  const storedName = String(formData.get("storedName") ?? "");
  if (!isSafeStoredName(storedName)) return;

  const documents = await getDocumentRecords();
  const document = documents.find((item) => item.storedName === storedName);
  if (!document) return;

  await unlink(path.join(UPLOAD_DIR, storedName)).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  await unlink(document.metadataPath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });
  await recordFileAudit("DELETE", "Document", document.title);
  revalidatePath("/admin/dokumentumok");
}

export async function moveDocumentAction(formData: FormData) {
  await requireAdmin();
  const storedName = String(formData.get("storedName") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!isSafeStoredName(storedName) || !["up", "down"].includes(direction)) return;

  const documents = await getDocumentRecords();
  const currentIndex = documents.findIndex((item) => item.storedName === storedName);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= documents.length) return;

  [documents[currentIndex], documents[targetIndex]] = [documents[targetIndex], documents[currentIndex]];
  await Promise.all(documents.map((document, index) => saveMetadata(document, index)));
  await recordFileAudit("UPDATE", "Document", documents[currentIndex]?.title);
  revalidatePath("/admin/dokumentumok");
}
