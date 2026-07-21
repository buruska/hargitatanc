"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { buttonSecondary, input, panel } from "@/lib/styles";

type AppearanceDate = {
  id: string;
  startsAt: string;
  title: string;
};

type DatesModalProps = {
  appearances: AppearanceDate[];
};

const dateFormatter = new Intl.DateTimeFormat("hu-RO", {
  dateStyle: "long",
  timeZone: "Europe/Bucharest",
});

export function DatesModal({ appearances }: DatesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const titleId = useId();
  const searchId = useId();
  const filteredAppearances = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("hu");
    if (!normalizedQuery) return appearances;

    return appearances.filter((appearance) => {
      const formattedDate = dateFormatter.format(new Date(appearance.startsAt)).toLocaleLowerCase("hu");
      return (
        appearance.title.toLocaleLowerCase("hu").includes(normalizedQuery) ||
        formattedDate.includes(normalizedQuery)
      );
    });
  }, [appearances, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button className={buttonSecondary} type="button" onClick={() => setIsOpen(true)}>
        Dátumok megjelenítése
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-charcoal/60 px-4 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            aria-labelledby={titleId}
            aria-modal="true"
            className={`${panel} max-h-[calc(100vh-4rem)] w-full max-w-[680px] overflow-y-auto p-5 min-[640px]:p-6`}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-[1.05]" id={titleId}>
                Fellépési dátumok
              </h2>
              <button
                aria-label="Modal bezárása"
                className="flex size-10 shrink-0 items-center justify-center border border-line bg-surface-strong text-xl font-extrabold text-muted hover:border-charcoal hover:text-charcoal"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <label className="sr-only" htmlFor={searchId}>
                Keresés a dátumok és előadások között
              </label>
              <input
                autoComplete="off"
                className={`${input} w-full`}
                id={searchId}
                placeholder="Dátum vagy előadás keresése…"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <p className="mt-2 text-xs font-bold text-muted">{filteredAppearances.length} találat</p>
            </div>

            <div className="mt-4 grid gap-2">
              {filteredAppearances.map((appearance) => (
                <div
                  className="grid gap-1 border border-line bg-surface-strong px-4 py-3 min-[560px]:grid-cols-[180px_1fr] min-[560px]:items-center min-[560px]:gap-5"
                  key={appearance.id}
                >
                  <time
                    className="text-sm font-extrabold text-thread-red"
                    dateTime={appearance.startsAt}
                  >
                    {dateFormatter.format(new Date(appearance.startsAt))}
                  </time>
                  <p className="font-serif text-lg font-bold leading-tight">{appearance.title}</p>
                </div>
              ))}

              {filteredAppearances.length === 0 ? (
                <p className="border border-dashed border-line-strong p-4 text-sm font-bold text-muted">
                  {appearances.length === 0 ? "Még nincs fellépés hozzáadva." : "Nincs találat."}
                </p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
