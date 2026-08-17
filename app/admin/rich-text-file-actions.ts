"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth";
import { recordFileAudit } from "@/lib/prisma";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "rich-text-files");
const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".odt", ".ods"]);

export async function uploadRichTextFileAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Válassz ki egy fájlt." };

  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) return { error: `Nem támogatott fájltípus: ${file.name}` };
  if (file.size > MAX_FILE_SIZE) return { error: "A fájl legfeljebb 20 MB méretű lehet." };

  await mkdir(UPLOAD_DIR, { recursive: true });
  const storedName = `${randomUUID()}${extension}`;
  await writeFile(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
  await recordFileAudit("CREATE", "RichTextFile", file.name);

  return {
    name: file.name,
    url: `/uploads/rich-text-files/${storedName}`,
  };
}
