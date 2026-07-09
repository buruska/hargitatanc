"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, panel } from "@/lib/styles";
import { deleteDefaultCoverAction, type DeleteDefaultCoverState } from "./actions";

type DeleteDefaultCoverModalProps = {
  id: string;
  imageUrl: string;
};

const initialState: DeleteDefaultCoverState = {};

export function DeleteDefaultCoverModal({ id, imageUrl }: DeleteDefaultCoverModalProps) {
  const [state, formAction, isPending] = useActionState(deleteDefaultCoverAction, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const titleId = useId();

  useEffect(() => {
    if (!state.success) {
      return;
    }

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
        className="inline-flex min-h-9 items-center justify-center border border-[#7f1712] bg-thread-red px-3 py-1.5 text-xs font-extrabold text-surface-strong transition hover:bg-[#8f1f1a]"
        type="button"
        onClick={() => setIsOpen(true)}
      >
        Törlés
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} w-full max-w-[480px] p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-[1.05]" id={titleId}>
                Alap borítókép törlése
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

            <p className="text-muted">Biztosan törölni akarod ezt az alap borítóképet?</p>
            <p className="mt-3 break-all text-sm font-bold text-charcoal">{imageUrl}</p>

            {state.error ? (
              <p className="mt-5 border-2 border-[rgb(179_38_32_/_42%)] bg-[rgb(179_38_32_/_10%)] px-3 py-2.5 text-thread-red">
                {state.error}
              </p>
            ) : null}

            <form action={formAction} className="mt-6 flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
              <input name="id" type="hidden" value={id} />
              <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>
                Mégsem
              </button>
              <button className={buttonPrimary} type="submit" disabled={isPending}>
                {isPending ? "Törlés..." : "Igen, törlés"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
