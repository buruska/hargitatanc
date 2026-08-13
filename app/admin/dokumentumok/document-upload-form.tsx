"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, input, label } from "@/lib/styles";
import { uploadDocumentsAction, type DocumentUploadState } from "./actions";

const initialState: DocumentUploadState = {};

export function DocumentUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadDocumentsAction, initialState);
  const [selectedFile, setSelectedFile] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    setSelectedFile("");
    router.refresh();
  }, [router, state.success]);

  return (
    <form action={formAction} className="grid gap-4" ref={formRef}>
      {state.error ? (
        <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 font-bold text-thread-red">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="border-2 border-pine/40 bg-pine/10 px-3 py-2.5 font-bold text-pine" role="status">
          {state.message}
        </p>
      ) : null}
      <label className={label}>
        Dokumentum neve
        <input className={input} maxLength={160} name="title" placeholder="Például: Éves szakmai beszámoló 2026" required type="text" />
      </label>
      <label className="grid cursor-pointer gap-2 border-2 border-dashed border-line-strong bg-surface-strong px-5 py-7 text-center transition hover:border-thread-red">
        <span className="font-serif text-xl font-bold text-charcoal">Dokumentum kiválasztása</span>
        <span className="text-sm font-bold text-muted">PDF, Word, Excel, PowerPoint, TXT, ODT vagy ODS · legfeljebb 20 MB</span>
        <input
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.odt,.ods"
          className="sr-only"
          name="document"
          onChange={(event) => setSelectedFile(event.target.files?.[0]?.name ?? "")}
          required
          type="file"
        />
      </label>
      {selectedFile ? (
        <p className="truncate border border-line bg-surface-strong px-3 py-2 text-sm font-bold text-muted">{selectedFile}</p>
      ) : null}
      <button className={`${buttonPrimary} w-fit`} disabled={isPending} type="submit">
        {isPending ? "Feltöltés..." : "Dokumentum feltöltése"}
      </button>
    </form>
  );
}
