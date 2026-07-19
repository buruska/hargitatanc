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

function isSafeExternalUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function TicketPurchaseModal({ items }: Readonly<{ items: TicketModalItem[] }>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
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
            <ul className="border-2 border-line-strong bg-surface-strong">
              {items.map((item) => {
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
                        {new Intl.DateTimeFormat("hu-RO", {
                          dateStyle: "long",
                          timeStyle: "short",
                          timeZone: "Europe/Bucharest",
                        }).format(new Date(item.startsAt))}
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
        onClick={() => setIsOpen(true)}
      >
        Jegyvásárlás
      </button>
      {isMounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
