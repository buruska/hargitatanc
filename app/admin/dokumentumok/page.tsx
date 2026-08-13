import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { AdminShell } from "../admin-shell";
import { adminTitle, eyebrow, panel } from "@/lib/styles";
import { DocumentUploadForm } from "./document-upload-form";

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
  const metadata = new Map<string, { title: string; originalFileName: string; storedName: string; uploadedAt: string }>();

  await Promise.all(metadataEntries.map(async (entry) => {
    try {
      const contents = await readFile(path.join(UPLOAD_DIR, entry.name), "utf8");
      const item = JSON.parse(contents) as { title: string; originalFileName: string; storedName: string; uploadedAt: string };
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

  return documents.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
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
        {documents.length === 0 ? (
          <p className="p-5 font-bold text-muted">Még nincs feltöltött dokumentum.</p>
        ) : (
          <ul className="divide-y divide-line">
            {documents.map((document) => (
              <li className="flex flex-col gap-3 px-5 py-4 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between" key={document.storedName}>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-charcoal">{document.name}</p>
                  {document.originalFileName ? <p className="truncate text-xs font-bold text-muted">{document.originalFileName}</p> : null}
                  <p className="mt-1 text-xs font-bold text-muted">
                    {formatFileSize(document.size)} · {dateFormatter.format(document.uploadedAt)}
                  </p>
                </div>
                <a
                  className="w-fit border border-line bg-surface-strong px-3 py-2 text-sm font-extrabold text-pine hover:border-charcoal hover:bg-thread-red hover:text-white"
                  href={`/uploads/documents/${encodeURIComponent(document.storedName)}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Megnyitás
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
