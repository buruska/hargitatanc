"use client";

import { useState } from "react";
import Image from "next/image";
import { panel } from "@/lib/styles";
import type { TicketMode } from "@/lib/tickets";
import { AddGalleryImagesModal } from "./add-gallery-images-modal";
import { DeleteGalleryImageModal } from "./delete-gallery-image-modal";
import { DeletePerformanceModal } from "./delete-performance-modal";
import { EditPerformanceModal } from "./edit-performance-modal";
import { NewPerformanceEventModal } from "./new-performance-event-modal";
import { PerformanceEventsToggle } from "./performance-events-toggle";
import { moveRunningPerformanceGalleryImageAction } from "./actions";

type PerformanceAccordionListProps = {
  performances: {
    id: string;
    title: string;
    summary: string;
    coverImageUrl: string;
    galleryImages: {
      id: string;
      imageUrl: string;
    }[];
    events: {
      id: string;
      startsAt: string;
      location: string;
      ticketMode: TicketMode;
      ticketText: string;
      ticketUrl: string;
    }[];
  }[];
};

export function PerformanceAccordionList({ performances }: PerformanceAccordionListProps) {
  const [openPerformanceId, setOpenPerformanceId] = useState<string | null>(null);

  return (
    <div className="grid gap-4">
      {performances.map((performance) => {
        const isOpen = openPerformanceId === performance.id;

        return (
          <article className={`${panel} overflow-hidden p-0`} key={performance.id}>
            <button
              aria-expanded={isOpen}
              className="grid w-full cursor-pointer gap-4 p-4 text-left transition hover:bg-surface-strong min-[620px]:grid-cols-[1fr_auto] min-[620px]:items-center"
              type="button"
              onClick={() => setOpenPerformanceId(isOpen ? null : performance.id)}
            >
              <span className="flex items-center gap-4">
                <Image
                  alt=""
                  className="aspect-[4/3] w-24 shrink-0 border-2 border-charcoal object-cover"
                  height={72}
                  src={performance.coverImageUrl}
                  width={96}
                />
                <span className="font-serif text-2xl font-bold leading-tight">{performance.title}</span>
              </span>
              <span className="inline-flex min-h-12 items-center justify-center gap-4 justify-self-start border-2 border-line bg-surface-strong px-4 py-2 text-sm font-extrabold leading-none text-charcoal transition hover:border-charcoal min-[620px]:justify-self-end">
                Bővebben
                <span className="grid size-5 place-items-center">
                  <span
                    className={`size-3 rotate-45 border-b-[3px] border-r-[3px] border-charcoal transition duration-500 ${
                      isOpen ? "mt-1 rotate-[225deg]" : "-mt-1"
                    }`}
                  />
                </span>
              </span>
            </button>

            <div
              className={`grid border-t border-line transition-[grid-template-rows] duration-500 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <EditPerformanceModal id={performance.id} summary={performance.summary} title={performance.title} />
                    <DeletePerformanceModal id={performance.id} title={performance.title} />
                  </div>
                  <p className="mt-4 text-muted">{performance.summary}</p>
                  <div className="mt-3">
                    <NewPerformanceEventModal performanceId={performance.id} performanceTitle={performance.title} />
                  </div>
                  <PerformanceEventsToggle
                    events={performance.events.map((event) => ({
                      ...event,
                      performanceCoverImageUrl: performance.coverImageUrl,
                      performanceTitle: performance.title,
                    }))}
                  />
                  <div className="mt-4">
                    <div className="mb-2 flex flex-col items-start justify-between gap-2 min-[520px]:flex-row min-[520px]:items-center">
                      <p className="text-xs font-extrabold uppercase tracking-normal text-petrol">Galéria:</p>
                      <AddGalleryImagesModal performanceId={performance.id} performanceTitle={performance.title} />
                    </div>
                    {performance.galleryImages.length > 0 ? (
                      <div className="grid gap-2">
                        {performance.galleryImages.map((galleryImage, index) => (
                          <article className="grid gap-2 border border-line bg-surface-strong p-2 min-[620px]:grid-cols-[92px_1fr] min-[620px]:items-center" key={galleryImage.id}>
                            <Image
                              alt=""
                              className="aspect-[16/10] w-full border-2 border-line-strong object-cover"
                              height={58}
                              src={galleryImage.imageUrl}
                              width={92}
                            />
                            <div className="flex flex-col gap-2 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between">
                              <p className="truncate text-xs font-bold text-muted">{galleryImage.imageUrl}</p>
                              <div className="flex shrink-0 flex-wrap gap-2">
                                <form action={moveRunningPerformanceGalleryImageAction}>
                                  <input name="id" type="hidden" value={galleryImage.id} />
                                  <input name="runningPerformanceId" type="hidden" value={performance.id} />
                                  <input name="direction" type="hidden" value="up" />
                                  <button
                                    className="inline-flex min-h-8 items-center justify-center border border-line bg-surface px-3 py-1 text-xs font-extrabold text-pine transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-45"
                                    type="submit"
                                    disabled={index === 0}
                                  >
                                    Fel
                                  </button>
                                </form>
                                <form action={moveRunningPerformanceGalleryImageAction}>
                                  <input name="id" type="hidden" value={galleryImage.id} />
                                  <input name="runningPerformanceId" type="hidden" value={performance.id} />
                                  <input name="direction" type="hidden" value="down" />
                                  <button
                                    className="inline-flex min-h-8 items-center justify-center border border-line bg-surface px-3 py-1 text-xs font-extrabold text-pine transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-45"
                                    type="submit"
                                    disabled={index === performance.galleryImages.length - 1}
                                  >
                                    Le
                                  </button>
                                </form>
                                <DeleteGalleryImageModal id={galleryImage.id} imageUrl={galleryImage.imageUrl} />
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="border border-line bg-surface-strong px-3 py-2 text-sm font-bold text-muted">
                        Ehhez a darabhoz még nincs galériakép hozzáadva.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
