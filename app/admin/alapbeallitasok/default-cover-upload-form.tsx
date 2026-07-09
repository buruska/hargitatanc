"use client";

import { DragEvent, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary } from "@/lib/styles";
import { uploadDefaultCoverAction, type DefaultCoverFormState } from "./actions";

const initialState: DefaultCoverFormState = {};

export function DefaultCoverUploadForm() {
  const [state, formAction, isPending] = useActionState(uploadDefaultCoverAction, initialState);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function updateSelectedFiles(files: FileList | null) {
    setSelectedFileNames(files ? Array.from(files).map((file) => file.name) : []);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;

    if (!fileInputRef.current || files.length === 0) {
      return;
    }

    fileInputRef.current.files = files;
    updateSelectedFiles(files);
  }

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    setSelectedFileNames([]);
    router.refresh();
  }, [router, state.success]);

  return (
    <form action={formAction} className="grid gap-4" encType="multipart/form-data" ref={formRef}>
      {state.error ? (
        <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
          {state.error}
        </p>
      ) : null}
      <label
        className={`grid min-h-[180px] cursor-pointer place-items-center border-2 border-dashed px-5 py-8 text-center transition ${
          isDragging ? "border-thread-red bg-[rgb(179_38_32_/_10%)]" : "border-line-strong bg-surface-strong hover:border-thread-red"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <span className="grid gap-2">
          <span className="font-serif text-[22px] font-bold leading-tight text-charcoal">Alap borítóképek feltöltése</span>
          <span className="text-sm font-extrabold text-muted">Húzd ide a képeket, vagy kattints a tallózáshoz.</span>
          <span className="text-xs font-bold text-muted">Egyszerre több képet is kiválaszthatsz.</span>
        </span>
        <input
          className="sr-only"
          name="coverImages"
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          required
          onChange={(event) => updateSelectedFiles(event.target.files)}
        />
      </label>
      {selectedFileNames.length > 0 ? (
        <div className="grid gap-1 border border-line bg-surface-strong px-3 py-2 text-sm font-bold text-muted">
          {selectedFileNames.map((fileName) => (
            <span className="truncate" key={fileName}>
              {fileName}
            </span>
          ))}
        </div>
      ) : null}
      <button className={`${buttonPrimary} w-fit`} type="submit" disabled={isPending}>
        {isPending ? "Feltöltés..." : "Feltöltés"}
      </button>
    </form>
  );
}
