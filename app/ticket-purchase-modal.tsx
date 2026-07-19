"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getTicketDisplayText, isTicketLink, type TicketMode } from "@/lib/tickets";

export type TicketModalItem = {
  id: string;
  kind: "event" | "performance";
  location: string;
  startsAt: string;
  ticketMode: TicketMode;
  ticketText: string;
  ticketUrl: string;
  title: string;
};

type TicketModeFilter = "ALL" | TicketMode;

const ticketModeFilterOptions: { label: string; value: TicketModeFilter }[] = [
  { label: "Összes jegymód", value: "ALL" },
  { label: "Online jegyvásárlás", value: "LINK" },
  { label: "Helyszíni jegyvásárlás", value: "VENUE" },
  { label: "Ingyenes", value: "FREE" },
  { label: "Bérletes", value: "PASS" },
  { label: "Egyedi jegyinformáció", value: "CUSTOM" },
];

function isSafeExternalUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const dateFormatter = new Intl.DateTimeFormat("hu-RO", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Bucharest",
});

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("hu-HU");
}

export function TicketPurchaseModal({ items }: Readonly<{ items: TicketModalItem[] }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketModeFilter, setTicketModeFilter] = useState<TicketModeFilter>("ALL");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const normalizedQuery = normalizeSearchValue(searchQuery.trim());
  const visibleItems = items.filter((item) => {
    if (ticketModeFilter !== "ALL" && (item.kind === "event" || item.ticketMode !== ticketModeFilter)) {
      return false;
    }

    if (!normalizedQuery) return true;

        const ticketText = item.kind === "event"
          ? "Részletek"
          : getTicketDisplayText({
              ticketMode: item.ticketMode,
              ticketText: item.ticketText,
              ticketUrl: item.ticketUrl,
            });
        const searchableText = [
          item.title,
          dateFormatter.format(new Date(item.startsAt)),
          item.startsAt,
          item.location,
          item.kind === "performance" ? "Előadás" : "Rendezvény",
          ticketText || "Jegyinformáció hamarosan",
        ].join(" ");

    return normalizeSearchValue(searchableText).includes(normalizedQuery);
  });

  const modal = isOpen ? (
    <div
      className="fixed inset-0 z-[300] grid place-items-center overflow-y-auto bg-charcoal/75 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[calc(100dvh-64px)] w-full max-w-[760px] overflow-y-auto border-2 border-line-strong bg-warm-canvas"
        role="dialog"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b-2 border-line-strong bg-warm-canvas px-[clamp(20px,4vw,36px)] py-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-thread-red">Program és jegyek</p>
            <h2 className="mt-1 font-serif text-[clamp(28px,5vw,44px)] font-bold leading-none text-charcoal" id={titleId}>
              Közelgő események
            </h2>
          </div>
          <button
            aria-label="Jegyvásárlás ablak bezárása"
            className="flex size-11 shrink-0 items-center justify-center border-2 border-charcoal bg-surface-strong text-2xl font-bold text-charcoal transition hover:bg-thread-red hover:text-white"
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </header>

        <div className="p-[clamp(20px,4vw,36px)]">
          {items.length > 0 ? (
            <>
              <div className="mb-5">
                <div className="grid gap-3 min-[620px]:grid-cols-[minmax(0,1fr)_240px]">
                  <div>
                    <label className="sr-only" htmlFor={`${titleId}-search`}>Keresés a közelgő események között</label>
                    <div className="relative">
                      <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" viewBox="0 0 24 24">
                        <path d="m21 21-4.35-4.35m2.35-5.15A7.5 7.5 0 1 1 4 11.5a7.5 7.5 0 0 1 15 0Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                      </svg>
                      <input
                        className="min-h-12 w-full border-2 border-line-strong bg-surface-strong py-3 pl-12 pr-4 text-sm font-bold text-charcoal outline-none transition placeholder:text-muted focus:border-thread-red"
                        id={`${titleId}-search`}
                        placeholder="Keresés cím, dátum vagy helyszín alapján"
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`${titleId}-ticket-mode`}>Szűrés jegyvásárlási mód szerint</label>
                    <select
                      className="min-h-12 w-full cursor-pointer border-2 border-line-strong bg-surface-strong px-4 py-3 text-sm font-extrabold text-charcoal outline-none transition focus:border-thread-red"
                      id={`${titleId}-ticket-mode`}
                      value={ticketModeFilter}
                      onChange={(event) => setTicketModeFilter(event.target.value as TicketModeFilter)}
                    >
                      {ticketModeFilterOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {searchQuery || ticketModeFilter !== "ALL" ? (
                  <p aria-live="polite" className="mt-2 text-xs font-bold text-muted">
                    {visibleItems.length} találat
                  </p>
                ) : null}
              </div>

              {visibleItems.length > 0 ? (
                <ul className="border-2 border-line-strong bg-surface-strong">
              {visibleItems.map((item) => {
                const ticket = { ticketMode: item.ticketMode, ticketText: item.ticketText, ticketUrl: item.ticketUrl };
                const hasSafeTicketLink = isTicketLink(ticket) && isSafeExternalUrl(item.ticketUrl);
                const ticketText = getTicketDisplayText(ticket);

                return (
                  <li className="grid gap-4 border-b-2 border-line-strong p-5 last:border-b-0 min-[620px]:grid-cols-[1fr_auto] min-[620px]:items-center" key={`${item.kind}-${item.id}`}>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-thread-red">
                        {item.kind === "performance" ? "Előadás" : "Rendezvény"}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-bold leading-tight text-charcoal">{item.title}</h3>
                      <p className="mt-2 text-sm font-bold text-muted">
                        {dateFormatter.format(new Date(item.startsAt))}
                        {item.location ? ` · ${item.location}` : ""}
                      </p>
                    </div>

                    {hasSafeTicketLink ? (
                      <a
                        className="inline-flex min-h-11 items-center justify-center border-2 border-charcoal bg-thread-red px-5 py-2 text-center text-sm font-extrabold uppercase tracking-[0.06em] text-white transition hover:bg-[#8f1f1a]"
                        href={item.ticketUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {ticketText}
                      </a>
                    ) : item.kind === "event" ? (
                      <Link
                        className="inline-flex min-h-11 items-center justify-center border-2 border-charcoal bg-thread-red px-5 py-2 text-center text-sm font-extrabold uppercase tracking-[0.06em] text-white transition hover:bg-[#8f1f1a]"
                        href="/esemenyeink"
                        onClick={() => setIsOpen(false)}
                      >
                        Részletek
                      </Link>
                    ) : (
                      <span className="max-w-[220px] border-2 border-line-strong bg-warm-canvas px-4 py-2 text-center text-sm font-extrabold text-charcoal">
                        {ticketText || "Jegyinformáció hamarosan"}
                      </span>
                    )}
                  </li>
                );
              })}
                </ul>
              ) : (
                <div className="border-2 border-line-strong bg-surface-strong p-8 text-center">
                  <p className="font-serif text-2xl font-bold text-charcoal">Nincs találat.</p>
                  <p className="mt-2 text-sm font-bold text-muted">Próbálj másik keresőkifejezést.</p>
                </div>
              )}
            </>
          ) : (
            <div className="border-2 border-line-strong bg-surface-strong p-8 text-center">
              <p className="font-serif text-2xl font-bold text-charcoal">Jelenleg nincs meghirdetett esemény.</p>
              <p className="mt-2 text-sm font-bold text-muted">Nézz vissza később az új időpontokért.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  ) : null;

  return (
    <>
      <button
        className="inline-flex min-h-9 items-center justify-center bg-thread-red px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.09em] text-white shadow-[3px_3px_0_rgb(33_31_27_/_24%)] transition hover:scale-105 hover:bg-[#8f1f1a] active:scale-95"
        type="button"
        onClick={() => {
          setSearchQuery("");
          setTicketModeFilter("ALL");
          setIsOpen(true);
        }}
      >
        Jegyvásárlás
      </button>
      {isMounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
