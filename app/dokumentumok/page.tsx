import { mkdir, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { getLocale } from "@/lib/i18n";
import { getSiteTextMap } from "@/lib/site-texts";
import { eyebrow, h1, panel } from "@/lib/styles";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "documents");

type DocumentMetadata = {
  title: string;
  storedName: string;
  uploadedAt: string;
  sortOrder?: number;
};

function legacyDisplayName(storedName: string) {
  const separator = storedName.indexOf("--");
  return separator === -1 ? storedName : storedName.slice(separator + 2);
}

async function getDocuments() {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
  const metadata = new Map<string, DocumentMetadata>();

  await Promise.all(entries.filter((entry) => entry.isFile() && entry.name.endsWith(".metadata.json")).map(async (entry) => {
    try {
      const item = JSON.parse(await readFile(path.join(UPLOAD_DIR, entry.name), "utf8")) as DocumentMetadata;
      metadata.set(item.storedName, item);
    } catch {
      // A sérült metaadatfájl nem akadályozhatja a dokumentumok megjelenítését.
    }
  }));

  const documents = await Promise.all(entries.filter((entry) => entry.isFile() && !entry.name.endsWith(".metadata.json")).map(async (entry) => {
    const fileStat = await stat(path.join(UPLOAD_DIR, entry.name));
    const itemMetadata = metadata.get(entry.name);
    return {
      storedName: entry.name,
      title: itemMetadata?.title ?? legacyDisplayName(entry.name),
      uploadedAt: itemMetadata ? new Date(itemMetadata.uploadedAt) : fileStat.birthtime,
      sortOrder: itemMetadata?.sortOrder,
    };
  }));

  return documents.sort((a, b) => {
    if (a.sortOrder !== undefined || b.sortOrder !== undefined) {
      return (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER);
    }
    return b.uploadedAt.getTime() - a.uploadedAt.getTime();
  });
}

export default async function DokumentumokPage() {
  const locale = await getLocale();
  const siteTexts = await getSiteTextMap(locale);
  const documents = await getDocuments();
  const text = {
    hu: { eyebrow: "Dokumentumtár", title: "Hivatalos dokumentumok", empty: "Jelenleg nincs közzétett dokumentum.", open: "Megnyitás" },
    ro: { eyebrow: "Arhivă de documente", title: "Documente oficiale", empty: "Momentan nu există documente publicate.", open: "Deschide" },
    en: { eyebrow: "Document archive", title: "Official documents", empty: "There are currently no published documents.", open: "Open" },
  }[locale];
  return (
    <main className="mx-auto min-h-[60vh] w-[calc(100%-36px)] max-w-[980px] pb-[72px] pt-[124px]">
      <p className={eyebrow}>{siteTexts["documents.eyebrow"]}</p>
      <h1 className={h1}>{siteTexts["documents.title"]}</h1>
      <section className={panel}>
        {documents.length === 0 ? (
          <p className="p-6 font-bold text-muted">{text.empty}</p>
        ) : (
          <ul className="divide-y divide-line">
            {documents.map((document) => (
              <li className="flex flex-col gap-4 px-5 py-5 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between" key={document.storedName}>
                <div className="min-w-0">
                  <h2 className="font-serif text-[clamp(20px,2.5vw,25px)] font-bold leading-tight">{document.title}</h2>
                </div>
                <a
                  className="inline-flex min-h-11 w-fit shrink-0 items-center border-2 border-charcoal bg-thread-red px-4 py-2 text-sm font-extrabold uppercase tracking-[0.06em] text-white transition hover:bg-charcoal"
                  href={`/uploads/documents/${encodeURIComponent(document.storedName)}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {text.open}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
