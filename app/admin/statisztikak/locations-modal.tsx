"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { buttonSecondary, input, panel } from "@/lib/styles";
import { LocationsMap } from "./locations-map";

type LocationsModalProps = {
  locations: string[];
};

export function LocationsModal({ locations }: LocationsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const titleId = useId();
  const searchId = useId();
  const filteredLocations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("hu");
    if (!normalizedQuery) return locations;

    return locations.filter((location) => location.toLocaleLowerCase("hu").includes(normalizedQuery));
  }, [locations, searchQuery]);

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
        Helyszínek megjelenítése
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
            className={`${panel} max-h-[calc(100vh-4rem)] w-full max-w-[980px] overflow-y-auto p-5 min-[640px]:p-6`}
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-serif text-[clamp(24px,3vw,34px)] font-bold leading-[1.05]" id={titleId}>
                Fellépési helyszínek
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

            <div className="mt-6 grid min-h-[430px] gap-5 min-[720px]:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="min-[720px]:border-r min-[720px]:border-line min-[720px]:pr-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
                  Helyszínek ({filteredLocations.length})
                </p>
                <label className="sr-only" htmlFor={searchId}>
                  Keresés a helyszínek között
                </label>
                <input
                  autoComplete="off"
                  className={`${input} mt-3 w-full`}
                  id={searchId}
                  placeholder="Helyszín keresése…"
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <div className="mt-3 grid max-h-[380px] gap-2 overflow-y-auto pr-1">
                  {filteredLocations.map((location, index) => (
                    <div className="flex items-start gap-3 border border-line bg-surface-strong px-3 py-2.5" key={location}>
                      <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-thread-red" aria-hidden="true" />
                      <p className="text-sm font-bold leading-snug text-muted">
                        <span className="sr-only">{index + 1}. </span>
                        {location}
                      </p>
                    </div>
                  ))}
                  {filteredLocations.length === 0 ? (
                    <p className="border border-dashed border-line-strong p-3 text-sm font-bold text-muted">
                      Nincs találat.
                    </p>
                  ) : null}
                </div>
              </aside>

              <div className="min-h-[320px] overflow-hidden border-2 border-charcoal">
                <LocationsMap locations={filteredLocations} />
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
