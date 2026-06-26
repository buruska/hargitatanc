"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { createRunningPerformanceEventAction, type PerformanceEventFormState } from "./actions";

type NewPerformanceEventModalProps = {
  performanceId: string;
  performanceTitle: string;
};

const initialState: PerformanceEventFormState = {};

export function NewPerformanceEventModal({ performanceId, performanceTitle }: NewPerformanceEventModalProps) {
  const [state, formAction, isPending] = useActionState(createRunningPerformanceEventAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const titleId = useId();

  function handleSubmit() {
    setIsOpen(false);
  }

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
      <button className={buttonSecondary} type="button" onClick={() => setIsOpen(true)}>
        Fellépés hozzáadása
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
              <div>
                <h2 className="font-serif text-[clamp(24px,3vw,36px)] font-bold leading-[1.05]" id={titleId}>
                  Fellépés hozzáadása
                </h2>
                <p className="mt-2 text-muted">{performanceTitle}</p>
              </div>
              <button
                aria-label="Modal bezárása"
                className="flex size-10 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <form action={formAction} className="grid gap-4" ref={formRef} onSubmit={handleSubmit}>
              {state.error ? (
                <p className="border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
                  {state.error}
                </p>
              ) : null}
              <input name="runningPerformanceId" type="hidden" value={performanceId} />
              <label className={label}>
                Dátum
                <input className={input} lang="hu" name="date" type="date" required />
              </label>
              <label className={label}>
                Kezdési időpont
                <input className={input} name="time" type="time" required />
              </label>
              <label className={label}>
                Helyszín
                <input className={input} name="location" type="text" required />
              </label>
              <label className={label}>
                Jegyvásárló link
                <input className={input} name="ticketUrl" type="url" placeholder="https://..." required />
              </label>
              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
                <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>
                  Mégsem
                </button>
                <button className={buttonPrimary} type="submit" disabled={isPending}>
                  {isPending ? "Mentés..." : "Mentés"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
