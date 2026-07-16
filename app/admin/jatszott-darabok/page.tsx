import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle, panel } from "@/lib/styles";
import { NewPerformanceModal } from "./new-performance-modal";
import { PerformanceAccordionList } from "./performance-accordion-list";

export default async function AdminFutoEloadasokPage() {
  const performances = await prisma.runningPerformance.findMany({
    where: {
      isGalleryOnly: false,
    },
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
          ticketMode: true,
          ticketText: true,
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

      <div className="mt-6">
        <PerformanceAccordionList
          performances={performances.map((performance) => ({
            ...performance,
            events: performance.events.map((event) => ({
              ...event,
              startsAt: event.startsAt.toISOString(),
            })),
          }))}
        />

        {performances.length === 0 ? (
          <article className={`${panel} p-5`}>
            <p className="font-extrabold text-muted">Nincs futó előadás.</p>
          </article>
        ) : null}
      </div>
    </AdminShell>
  );
}
