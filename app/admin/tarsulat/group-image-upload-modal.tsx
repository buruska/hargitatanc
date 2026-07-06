"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonPrimary, buttonSecondary, input, label, panel } from "@/lib/styles";
import { uploadGroupImageAction, type GroupImageFormState } from "./actions";

const initialState: GroupImageFormState = {
  message: "",
  status: "idle",
};

export function GroupImageUploadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(uploadGroupImageAction, initialState);
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setIsOpen(false);
      }
    }

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending]);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    setIsOpen(false);
    router.refresh();
  }, [router, state.status]);

  return (
    <>
      <button className={buttonPrimary} type="button" onClick={() => setIsOpen(true)}>
        Csoportkép módosítása
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation">
          <section
            aria-labelledby="group-image-upload-title"
            aria-modal="true"
            className={`${panel} w-full max-w-[520px] p-6`}
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-tight" id="group-image-upload-title">
                Csoportkép módosítása
              </h2>
              <button
                aria-label="Modal bezárása"
                className="grid size-9 shrink-0 place-items-center border border-line bg-surface-strong text-[20px] font-extrabold text-thread-red transition hover:border-thread-red hover:bg-thread-red hover:text-surface-strong"
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <form action={formAction} className="grid gap-4">
              <label className={label}>
                Csoportkép
                <input
                  accept="image/*"
                  className={`${input} file:mr-4 file:border-0 file:bg-thread-red file:px-3 file:py-2 file:font-extrabold file:text-surface-strong`}
                  name="groupImage"
                  required
                  type="file"
                />
              </label>

              {state.status === "error" ? (
                <p className="border border-thread-red bg-surface-strong px-3 py-2 text-sm font-extrabold text-thread-red">
                  {state.message}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 min-[520px]:flex-row min-[520px]:justify-end">
                <button className={buttonSecondary} type="button" onClick={() => setIsOpen(false)}>
                  Mégse
                </button>
                <button className={buttonPrimary} disabled={isPending} type="submit">
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
