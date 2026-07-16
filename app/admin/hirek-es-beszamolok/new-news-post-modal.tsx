"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { RichTextField } from "../tarsulat/rich-text-field";
import { createNewsPostAction, type NewsPostFormState } from "./actions";

const initialState: NewsPostFormState = {};

const months = [
  { value: "1", label: "január" },
  { value: "2", label: "február" },
  { value: "3", label: "március" },
  { value: "4", label: "április" },
  { value: "5", label: "május" },
  { value: "6", label: "június" },
  { value: "7", label: "július" },
  { value: "8", label: "augusztus" },
  { value: "9", label: "szeptember" },
  { value: "10", label: "október" },
  { value: "11", label: "november" },
  { value: "12", label: "december" },
];

function getTodayParts() {
  const today = new Date();
  return {
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1),
    day: String(today.getDate()),
  };
}

export function NewNewsPostModal() {
  const [state, formAction, isPending] = useActionState(createNewsPostAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [dateParts, setDateParts] = useState(getTodayParts);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    setIsOpen(false);
    router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [isOpen]);

  return <>
    <button className="inline-flex min-h-[46px] items-center justify-center border-2 border-charcoal bg-thread-red px-5 py-2.5 text-sm font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]" type="button" onClick={() => { setDateParts(getTodayParts()); setIsOpen(true); }}>
      Hír feltöltése
    </button>
    {isOpen ? (
      <div className="fixed inset-0 z-[220] grid place-items-center overflow-y-auto bg-charcoal/60 px-4 py-8" role="presentation">
        <section aria-labelledby={titleId} aria-modal="true" className={`${panel} max-h-[calc(100vh-64px)] w-full max-w-[800px] overflow-y-auto p-6`} role="dialog">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>Hír feltöltése</h2>
            <button aria-label="Modal bezárása" className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal" type="button" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <form action={formAction} className="grid gap-5" ref={formRef}>
            {state.error ? <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">{state.error}</p> : null}
            <label className={label}>Hír címe<input className={input} name="title" required /></label>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-extrabold text-muted">Dátum</legend>
              <input name="publishedAt" type="hidden" value={`${dateParts.year}-${dateParts.month.padStart(2, "0")}-${dateParts.day.padStart(2, "0")}`} />
              <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-[1fr_1.3fr_1fr]">
                <label className={label}>Év<input className={input} inputMode="numeric" min="2000" name="year" required type="number" value={dateParts.year} onChange={(event) => setDateParts((current) => ({ ...current, year: event.target.value }))} /></label>
                <label className={label}>Hónap<select className={input} name="month" required value={dateParts.month} onChange={(event) => setDateParts((current) => ({ ...current, month: event.target.value }))}>{months.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}</select></label>
                <label className={label}>Nap<input className={input} inputMode="numeric" max="31" min="1" name="day" required type="number" value={dateParts.day} onChange={(event) => setDateParts((current) => ({ ...current, day: event.target.value }))} /></label>
              </div>
            </fieldset>
            <label className={label}>Borítókép<input accept="image/*" className={`${input} file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-surface-strong`} name="coverImage" required type="file" /></label>
            <RichTextField label="Tartalom" name="content" />
            <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
              <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>Mégsem</button>
              <button className={buttonPrimary} disabled={isPending} type="submit">{isPending ? "Feltöltés..." : "Hír feltöltése"}</button>
            </div>
          </form>
        </section>
      </div>
    ) : null}
  </>;
}
