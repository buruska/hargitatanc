import Image from "next/image";
import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle, panel } from "@/lib/styles";
import { AddGalleryImagesModal } from "./add-gallery-images-modal";
import { DeletePerformanceModal } from "./delete-performance-modal";
import { EditPerformanceModal } from "./edit-performance-modal";
import { NewPerformanceEventModal } from "./new-performance-event-modal";
import { NewPerformanceModal } from "./new-performance-modal";
import { PerformanceEventsToggle } from "./performance-events-toggle";
import { moveRunningPerformanceGalleryImageAction } from "./actions";
import { DeleteGalleryImageModal } from "./delete-gallery-image-modal";

export default async function AdminFutoEloadasokPage() {
  const performances = await prisma.runningPerformance.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      summary: true,
      coverImageUrl: true,
      galleryImages: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          imageUrl: true,
        },
      },
      events: {
        orderBy: {
          startsAt: "asc",
        },
        select: {
          id: true,
          startsAt: true,
          location: true,
          ticketUrl: true,
        },
      },
    },
  });

  return (
    <AdminShell>
      <div className="flex flex-col items-start justify-between gap-4 min-[861px]:flex-row min-[861px]:items-center">
        <h1 className={adminTitle}>Játszott darabok</h1>
        <NewPerformanceModal />
      </div>

      <div className="mt-6 grid gap-4">
        {performances.map((performance) => (
          <article className={`${panel} grid gap-4 p-4 min-[720px]:grid-cols-[1fr_170px] min-[720px]:items-start`} key={performance.id}>
            <div>
              <div className="flex items-center gap-4">
                <Image
                  alt=""
                  className="aspect-[4/3] w-24 shrink-0 border-2 border-charcoal object-cover"
                  height={72}
                  src={performance.coverImageUrl}
                  width={96}
                />
                <h2 className="font-serif text-2xl font-bold leading-tight">{performance.title}</h2>
              </div>
              <p className="mt-2 text-muted">{performance.summary}</p>
              <div className="mt-3">
                <NewPerformanceEventModal performanceId={performance.id} performanceTitle={performance.title} />
              </div>
              <PerformanceEventsToggle
                events={performance.events.map((event) => ({
                  ...event,
                  performanceCoverImageUrl: performance.coverImageUrl,
                  performanceTitle: performance.title,
                  startsAt: event.startsAt.toISOString(),
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
            <div className="grid gap-2">
              <EditPerformanceModal id={performance.id} summary={performance.summary} title={performance.title} />
              <DeletePerformanceModal id={performance.id} title={performance.title} />
            </div>
          </article>
        ))}

        {performances.length === 0 ? (
          <article className={`${panel} p-5`}>
            <p className="font-extrabold text-muted">Nincs futó előadás.</p>
          </article>
        ) : null}
      </div>
    </AdminShell>
  );
}
