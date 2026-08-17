"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buttonSecondary, panel } from "@/lib/styles";
import { deleteAdminAction } from "./actions";

export function DeleteAdminButton({ email, userId }: { email: string; userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    setError(undefined);
    startTransition(async () => {
      const result = await deleteAdminAction(userId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button className={`${buttonSecondary} min-h-0 px-3 py-2 text-sm text-thread-red`} type="button" onClick={() => setIsOpen(true)}>
        Törlés
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-[220] grid place-items-center bg-charcoal/60 px-4 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isPending) setIsOpen(false); }}>
          <section aria-modal="true" className={`${panel} w-full max-w-[480px] p-6`} role="dialog">
            <h2 className="font-serif text-2xl font-bold">Adminisztrátor törlése</h2>
            <p className="mt-3 font-bold leading-relaxed text-muted">
              Biztosan törlöd ezt a fiókot? <strong className="text-charcoal">{email}</strong>
            </p>
            <p className="mt-2 text-sm font-bold text-thread-red">A művelet nem vonható vissza.</p>
            {error ? <p className="mt-4 border-2 border-thread-red/40 bg-thread-red/10 px-3 py-2.5 font-bold text-thread-red" role="alert">{error}</p> : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button className={buttonSecondary} disabled={isPending} type="button" onClick={() => setIsOpen(false)}>Mégse</button>
              <button className="inline-flex min-h-[46px] items-center justify-center border-2 border-charcoal bg-thread-red px-[18px] py-3 font-extrabold text-surface-strong disabled:opacity-60" disabled={isPending} type="button" onClick={handleDelete}>
                {isPending ? "Törlés…" : "Fiók törlése"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
