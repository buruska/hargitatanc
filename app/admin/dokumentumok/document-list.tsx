"use client";

import { deleteDocumentAction, moveDocumentAction, renameDocumentAction } from "./actions";

type DocumentListItem = {
  storedName: string;
  name: string;
  originalFileName?: string;
  sizeLabel: string;
  dateLabel: string;
};

const smallButton = "border border-line bg-surface-strong px-3 py-2 text-sm font-extrabold text-pine hover:border-charcoal hover:bg-thread-red hover:text-white disabled:cursor-not-allowed disabled:opacity-35";

export function DocumentList({ documents }: { documents: DocumentListItem[] }) {
  if (documents.length === 0) {
    return <p className="p-5 font-bold text-muted">Még nincs feltöltött dokumentum.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {documents.map((document, index) => (
        <li className="grid gap-4 px-5 py-4" key={document.storedName}>
          <div className="flex flex-col gap-3 min-[620px]:flex-row min-[620px]:items-start min-[620px]:justify-between">
            <div className="min-w-0">
              <p className="truncate font-extrabold text-charcoal">{document.name}</p>
              {document.originalFileName ? <p className="truncate text-xs font-bold text-muted">{document.originalFileName}</p> : null}
              <p className="mt-1 text-xs font-bold text-muted">{document.sizeLabel} · {document.dateLabel}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={moveDocumentAction}>
                <input name="storedName" type="hidden" value={document.storedName} />
                <input name="direction" type="hidden" value="up" />
                <button aria-label={`${document.name} mozgatása felfelé`} className={smallButton} disabled={index === 0} type="submit">↑ Fel</button>
              </form>
              <form action={moveDocumentAction}>
                <input name="storedName" type="hidden" value={document.storedName} />
                <input name="direction" type="hidden" value="down" />
                <button aria-label={`${document.name} mozgatása lefelé`} className={smallButton} disabled={index === documents.length - 1} type="submit">↓ Le</button>
              </form>
              <a className={smallButton} href={`/uploads/documents/${encodeURIComponent(document.storedName)}`} rel="noopener noreferrer" target="_blank">Megnyitás</a>
            </div>
          </div>
          <div className="flex flex-col gap-2 min-[620px]:flex-row">
            <form action={renameDocumentAction} className="flex min-w-0 flex-1 gap-2">
              <input name="storedName" type="hidden" value={document.storedName} />
              <input aria-label="Dokumentum neve" className="min-h-10 min-w-0 flex-1 border-2 border-line-strong bg-surface-strong px-3 text-sm font-bold" defaultValue={document.name} maxLength={160} name="title" required type="text" />
              <button className={smallButton} type="submit">Név mentése</button>
            </form>
            <form action={deleteDocumentAction} onSubmit={(event) => { if (!window.confirm(`Biztosan törlöd ezt a dokumentumot: ${document.name}?`)) event.preventDefault(); }}>
              <input name="storedName" type="hidden" value={document.storedName} />
              <button className="border border-thread-red bg-surface-strong px-3 py-2 text-sm font-extrabold text-thread-red hover:bg-thread-red hover:text-white" type="submit">Törlés</button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
