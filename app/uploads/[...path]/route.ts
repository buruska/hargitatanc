import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_ROOT = path.resolve(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

type UploadRouteContext = {
  params: Promise<{ path: string[] }>;
};

function getUploadPath(segments: string[]) {
  if (
    segments.length === 0
    || segments.some((segment) =>
      !segment
      || segment === "."
      || segment === ".."
      || segment.includes("/")
      || segment.includes("\\")
      || segment.includes("\0"))
  ) {
    return null;
  }

  const filePath = `${UPLOAD_ROOT}${path.sep}${segments.join(path.sep)}`;
  const relativePath = path.relative(UPLOAD_ROOT, filePath);

  if (!relativePath || relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

async function serveUpload(context: UploadRouteContext, includeBody: boolean) {
  const { path: segments } = await context.params;
  const filePath = getUploadPath(segments);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const fileStats = await stat(/* turbopackIgnore: true */ filePath);

    if (!fileStats.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const extension = path.extname(filePath).toLowerCase();
    const headers = new Headers({
      "Cache-Control": "public, max-age=86400",
      "Content-Length": String(fileStats.size),
      "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
      "Last-Modified": fileStats.mtime.toUTCString(),
      "X-Content-Type-Options": "nosniff",
    });

    if (!includeBody) {
      return new Response(null, { headers });
    }

    return new Response(await readFile(/* turbopackIgnore: true */ filePath), { headers });
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code === "ENOENT" || fileError.code === "EISDIR") {
      return new Response("Not found", { status: 404 });
    }

    console.error("A feltöltött fájl kiszolgálása nem sikerült.", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function GET(_request: Request, context: UploadRouteContext) {
  return serveUpload(context, true);
}

export async function HEAD(_request: Request, context: UploadRouteContext) {
  return serveUpload(context, false);
}
