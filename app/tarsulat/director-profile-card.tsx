"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DirectorProfileCardProps = {
  bio: string;
  imageUrl: string;
  name: string;
};

export function DirectorProfileCard({ bio, imageUrl, name }: DirectorProfileCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const displayName = name || "Igazgató";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const modal = (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-charcoal/70 px-4 py-8 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="max-h-[min(820px,calc(100vh-64px))] w-[80vw] max-w-[1180px] overflow-y-auto border-2 border-line-strong bg-surface shadow-[16px_16px_0_rgb(33_31_27_/_18%)] max-[640px]:w-full"
        role="dialog"
      >
        <div className="p-[clamp(22px,4vw,42px)]">
          <div className="mb-6 flex items-start justify-between gap-5">
            <div>
              <h2 className="font-serif text-[clamp(30px,4vw,48px)] font-bold leading-[1.05] text-charcoal" id={titleId}>
                {displayName}
              </h2>
              <p className="mt-2 font-serif text-[18px] font-bold leading-tight text-thread-red">igazgató</p>
            </div>
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
          <div>
            <Image
              alt={`${displayName} igazgató`}
              className="mb-5 w-full border-2 border-line-strong object-cover min-[760px]:float-left min-[760px]:mb-4 min-[760px]:mr-8 min-[760px]:h-[50vh] min-[760px]:max-h-[520px] min-[760px]:min-h-[320px] min-[760px]:w-auto"
              height={560}
              src={imageUrl}
              width={380}
            />
            {bio ? (
              <div
                className="rich-text-editor text-[clamp(17px,2vw,20px)] font-bold leading-relaxed text-charcoal"
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <>
      <div className="group about-director-reveal relative mb-14 w-full max-w-[340px] justify-self-end border-2 border-line-strong shadow-[12px_12px_0_rgb(33_31_27_/_14%)]">
        <button
          aria-label={`${displayName} adatainak megnyitása`}
          className="block w-full cursor-pointer text-left"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          <span className="block overflow-hidden">
            <Image
              alt={`${displayName} igazgató`}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              height={425}
              src={imageUrl}
              width={340}
            />
          </span>
          {name ? (
            <span className="absolute -bottom-12 left-2.5 block w-full shadow-[8px_8px_0_rgb(33_31_27_/_12%)] transition-all duration-300 ease-out group-hover:bottom-0 group-hover:left-0 group-hover:shadow-none">
              <span className="relative block bg-thread-red px-4 py-3 text-center font-sans text-[clamp(16px,2vw,20px)] font-extrabold leading-tight text-surface-strong">
                <span className="block transition-opacity duration-200 group-hover:opacity-0">{name}</span>
                <span className="absolute inset-x-4 top-1/2 block -translate-y-1/2 text-sm tracking-[0.18em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  BŐVEBBEN
                </span>
              </span>
              <span className="block max-h-10 w-full overflow-hidden bg-surface-strong px-4 py-2 text-center font-serif text-sm font-bold leading-tight text-thread-red transition-all duration-300 ease-out group-hover:max-h-0 group-hover:py-0 group-hover:opacity-0">
                igazgató
              </span>
            </span>
          ) : null}
        </button>
      </div>

      {isOpen && isMounted ? createPortal(modal, document.body) : null}
    </>
  );
}
