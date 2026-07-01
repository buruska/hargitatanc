import Image from "next/image";
import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle, panel } from "@/lib/styles";
import { DeletePerformanceModal } from "./delete-performance-modal";
import { EditPerformanceModal } from "./edit-performance-modal";
import { NewPerformanceEventModal } from "./new-performance-event-modal";
import { NewPerformanceModal } from "./new-performance-modal";
import { PerformanceEventsToggle } from "./performance-events-toggle";

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
        <h1 className={adminTitle}>Futó előadások</h1>
        <NewPerformanceModal />
      </div>

      <div className="mt-6 grid gap-4">
        {performances.map((performance) => (
          <article className={`${panel} grid gap-4 p-4 min-[720px]:grid-cols-[112px_1fr_170px] min-[720px]:items-center`} key={performance.id}>
            <Image
              alt=""
              className="aspect-[4/3] w-full border-2 border-charcoal object-cover min-[720px]:w-28"
              height={84}
              src={performance.coverImageUrl}
              width={112}
            />
            <div>
              <h2 className="font-serif text-2xl font-bold leading-tight">{performance.title}</h2>
              <p className="mt-2 text-muted">{performance.summary}</p>
              <PerformanceEventsToggle
                events={performance.events.map((event) => ({
                  ...event,
                  startsAt: event.startsAt.toISOString(),
                }))}
              />
            </div>
            <div className="grid gap-2">
              <NewPerformanceEventModal performanceId={performance.id} performanceTitle={performance.title} />
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
