"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, label, panel } from "@/lib/styles";
import { addRunningPerformanceGalleryImagesAction, type AddGalleryImagesState } from "./actions";

type AddGalleryImagesModalProps = {
  performanceId: string;
  performanceTitle: string;
};

const initialState: AddGalleryImagesState = {};

export function AddGalleryImagesModal({ performanceId, performanceTitle }: AddGalleryImagesModalProps) {
  const [state, formAction, isPending] = useActionState(addRunningPerformanceGalleryImagesAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (!state.success) {
      return;
    }

    formRef.current?.reset();
    setIsOpen(false);
    router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="inline-flex min-h-9 items-center justify-center border-2 border-charcoal bg-thread-red px-3 py-1.5 text-xs font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Új képek hozzáadása
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} w-full max-w-[560px] p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>
                Új képek hozzáadása
              </h2>
              <button
                aria-label="Modal bezárása"
                className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                x
              </button>
            </div>

            <p className="mb-4 text-sm font-bold text-muted">{performanceTitle}</p>

            <form action={formAction} className="grid gap-4" encType="multipart/form-data" ref={formRef}>
              <input name="runningPerformanceId" type="hidden" value={performanceId} />
              {state.error ? (
                <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
                  {state.error}
                </p>
              ) : null}
              <label className={label}>
                Galériaképek
                <input
                  className="min-h-[46px] border-2 border-line-strong bg-surface-strong px-3 py-2.5 font-sans text-charcoal file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-surface-strong"
                  name="galleryImages"
                  type="file"
                  accept="image/*"
                  multiple
                  required
                />
              </label>
              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
                <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>
                  Mégsem
                </button>
                <button className={buttonPrimary} type="submit" disabled={isPending}>
                  {isPending ? "Feltöltés..." : "Feltöltés"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
