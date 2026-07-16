"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { createPerformanceGalleryAction, type CreateGalleryState } from "./actions";

const initialState: CreateGalleryState = {};

export function NewGalleryModal() {
  const [state, formAction, isPending] = useActionState(createPerformanceGalleryAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [previews, setPreviews] = useState<string[]>([]);
  const [coverImageIndex, setCoverImageIndex] = useState(0);
  const [selectionError, setSelectionError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (!state.success) return;
    formRef.current?.reset();
    setStep(1);
    setPreviews([]);
    setCoverImageIndex(0);
    setSelectionError("");
    setIsOpen(false);
    router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [isOpen]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview)), [previews]);

  function continueToCoverSelection() {
    if (!titleRef.current?.reportValidity() || !imagesRef.current?.reportValidity()) return;
    const files = Array.from(imagesRef.current.files ?? []);
    if (files.length === 0) return;
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setSelectionError("Egy kép legfeljebb 5 MB lehet.");
      return;
    }
    if (files.reduce((total, file) => total + file.size, 0) > 40 * 1024 * 1024) {
      setSelectionError("A kiválasztott képek összmérete legfeljebb 40 MB lehet.");
      return;
    }
    setSelectionError("");
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setPreviews(files.map((file) => URL.createObjectURL(file)));
    setCoverImageIndex(0);
    setStep(2);
  }

  return <>
    <button className="inline-flex min-h-[46px] items-center justify-center border-2 border-charcoal bg-thread-red px-5 py-2.5 text-sm font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]" type="button" onClick={() => setIsOpen(true)}>
      Új galéria hozzáadása
    </button>
    {isOpen ? <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-charcoal/60 px-4 py-8" role="presentation">
      <section aria-labelledby={titleId} aria-modal="true" className={`${panel} w-full max-w-[620px] p-6`} role="dialog">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>Új galéria hozzáadása</h2>
          <button aria-label="Modal bezárása" className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold" type="button" onClick={() => setIsOpen(false)}>×</button>
        </div>
        <form action={formAction} className="grid gap-5" ref={formRef}>
          {(state.error || selectionError) ? <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">{state.error || selectionError}</p> : null}
          <div className={step === 1 ? "grid gap-5" : "hidden"}>
            <label className={label}>Galéria címe<input className={input} name="title" ref={titleRef} required /></label>
            <label className={label}>Galériaképek<input accept="image/*" className="min-h-[46px] border-2 border-line-strong bg-surface-strong px-3 py-2.5 file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-white" multiple name="galleryImages" ref={imagesRef} required type="file" /></label>
            <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
              <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>Mégsem</button>
              <button className={buttonPrimary} type="button" onClick={continueToCoverSelection}>Tovább</button>
            </div>
          </div>

          {step === 2 ? <div className="grid gap-5">
            <div>
              <p className="mb-1 text-sm font-extrabold uppercase tracking-[0.08em] text-thread-red">2. lépés</p>
              <h3 className="font-serif text-2xl font-bold">Borítókép kiválasztása</h3>
              <p className="mt-1 text-sm font-bold text-muted">Kattints arra a képre, amelyiket a galéria borítójaként szeretnéd használni.</p>
            </div>
            <input name="coverImageIndex" type="hidden" value={coverImageIndex} />
            <div className="grid max-h-[52vh] grid-cols-2 gap-3 overflow-y-auto pr-1 min-[560px]:grid-cols-3">
              {previews.map((preview, index) => <button className={`group relative border-4 transition ${coverImageIndex === index ? "border-thread-red" : "border-transparent hover:border-line-strong"}`} key={preview} type="button" onClick={() => setCoverImageIndex(index)}>
                <Image alt={`Feltöltött kép ${index + 1}`} className="aspect-[4/3] w-full object-cover" height={180} src={preview} unoptimized width={240} />
                {coverImageIndex === index ? <span className="absolute bottom-2 left-2 bg-thread-red px-2 py-1 text-xs font-extrabold text-white">Borító</span> : null}
              </button>)}
            </div>
            <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
              <button className={buttonSecondary} type="button" onClick={() => setStep(1)}>Vissza</button>
              <button className={buttonPrimary} disabled={isPending} type="submit">{isPending ? "Feltöltés..." : "Galéria véglegesítése"}</button>
            </div>
          </div> : null}
        </form>
      </section>
    </div> : null}
  </>;
}
