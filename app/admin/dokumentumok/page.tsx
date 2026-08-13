import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { AdminShell } from "../admin-shell";
import { adminTitle, eyebrow, panel } from "@/lib/styles";
import { DocumentUploadForm } from "./document-upload-form";
import { DocumentList } from "./document-list";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "documents");

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function legacyDisplayName(storedName: string) {
  const separator = storedName.indexOf("--");
  return separator === -1 ? storedName : storedName.slice(separator + 2);
}

async function getDocuments() {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
  const metadataEntries = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".metadata.json"));
  const metadata = new Map<string, { title: string; originalFileName: string; storedName: string; uploadedAt: string; sortOrder?: number }>();

  await Promise.all(metadataEntries.map(async (entry) => {
    try {
      const contents = await readFile(path.join(UPLOAD_DIR, entry.name), "utf8");
      const item = JSON.parse(contents) as { title: string; originalFileName: string; storedName: string; uploadedAt: string; sortOrder?: number };
      metadata.set(item.storedName, item);
    } catch {
      // A sérült metaadatfájl nem akadályozhatja a többi dokumentum listázását.
    }
  }));

  const documents = await Promise.all(
    entries.filter((entry) => entry.isFile() && !entry.name.endsWith(".metadata.json")).map(async (entry) => {
      const fileStat = await stat(path.join(UPLOAD_DIR, entry.name));
      const itemMetadata = metadata.get(entry.name);
      return {
        storedName: entry.name,
        name: itemMetadata?.title ?? legacyDisplayName(entry.name),
        originalFileName: itemMetadata?.originalFileName,
        size: fileStat.size,
        uploadedAt: itemMetadata ? new Date(itemMetadata.uploadedAt) : fileStat.birthtime,
      };
    }),
  );

  return documents.sort((a, b) => {
    const aOrder = metadata.get(a.storedName)?.sortOrder;
    const bOrder = metadata.get(b.storedName)?.sortOrder;
    if (aOrder !== undefined || bOrder !== undefined) {
      return (aOrder ?? Number.MAX_SAFE_INTEGER) - (bOrder ?? Number.MAX_SAFE_INTEGER);
    }
    return b.uploadedAt.getTime() - a.uploadedAt.getTime();
  });
}

export default async function AdminDokumentumokPage() {
  const documents = await getDocuments();
  const dateFormatter = new Intl.DateTimeFormat("hu-RO", { dateStyle: "medium", timeStyle: "short" });

  return (
    <AdminShell>
      <p className={eyebrow}>Tartalomkezelés</p>
      <h1 className={adminTitle}>Dokumentumok</h1>

      <section className={`${panel} mb-6 p-5`}>
        <h2 className="mb-4 font-serif text-2xl font-bold">Új dokumentum feltöltése</h2>
        <DocumentUploadForm />
      </section>

      <section className={panel}>
        <div className="border-b-2 border-charcoal px-5 py-4">
          <h2 className="font-serif text-2xl font-bold">Feltöltött dokumentumok</h2>
          <p className="mt-1 text-sm font-bold text-muted">{documents.length} fájl</p>
        </div>
        <DocumentList documents={documents.map((document) => ({
          storedName: document.storedName,
          name: document.name,
          originalFileName: document.originalFileName,
          sizeLabel: formatFileSize(document.size),
          dateLabel: dateFormatter.format(document.uploadedAt),
        }))} />
      </section>
    </AdminShell>
  );
}
