"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { updateRunningPerformanceTranslationAction, type PerformanceFormState } from "./actions";
import { RichTextField } from "../tarsulat/rich-text-field";

const initialState: PerformanceFormState = {};

export function PerformanceTranslationModal({
  coverImageUrl,
  id,
  initialSummary,
  initialTitle,
  locale,
}: {
  coverImageUrl: string;
  id: string;
  initialSummary: string;
  initialTitle: string;
  locale: "ro" | "en";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateRunningPerformanceTranslationAction, initialState);
  const router = useRouter();
  const titleId = useId();
  const languageName = locale === "ro" ? "román" : "angol";

  useEffect(() => {
    if (!state.success) return;
    setIsOpen(false);
    router.refresh();
  }, [router, state.success]);

  return (
    <>
      <button
        className="inline-flex min-h-8 items-center justify-center border border-petrol/55 bg-petrol/10 px-3 py-1.5 text-xs font-extrabold text-petrol transition hover:bg-petrol/20 hover:text-charcoal"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        {locale === "ro" ? "Román leírás megadása" : "Angol leírás megadása"}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section aria-labelledby={titleId} aria-modal="true" className={`${panel} max-h-[calc(100vh-64px)] w-full max-w-[760px] overflow-y-auto p-6`} role="dialog">
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-tight" id={titleId}>
                {languageName.charAt(0).toUpperCase() + languageName.slice(1)} leírás módosítása
              </h2>
              <button
                aria-label="Modal bezárása"
                className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>
            <form action={formAction} className="grid gap-4">
              <input name="id" type="hidden" value={id} />
              <input name="locale" type="hidden" value={locale} />
              <label className={label}>
                {languageName.charAt(0).toUpperCase() + languageName.slice(1)} cím
                <input className={input} defaultValue={initialTitle} name="title" required type="text" />
              </label>
              <div className="grid gap-2">
                <p className="text-sm font-extrabold text-muted">Jelenlegi borítókép</p>
                <Image
                  alt={`${initialTitle} jelenlegi borítóképe`}
                  className="aspect-[16/10] w-full max-w-[360px] border-2 border-line-strong object-cover"
                  height={225}
                  src={coverImageUrl}
                  width={360}
                />
              </div>
              <RichTextField
                initialValue={initialSummary}
                label={`${languageName.charAt(0).toUpperCase() + languageName.slice(1)} formázható leírás`}
                name="summary"
              />
              {state.error ? <p className="border-2 border-thread-red/40 bg-thread-red/10 px-3 py-2 text-thread-red">{state.error}</p> : null}
              <div className="flex justify-end gap-3">
                <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>Mégsem</button>
                <button className={buttonPrimary} disabled={isPending} type="submit">{isPending ? "Mentés..." : "Mentés"}</button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
