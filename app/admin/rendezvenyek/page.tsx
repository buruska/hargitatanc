import Image from "next/image";
import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle, panel } from "@/lib/styles";
import { NewEventModal } from "./new-event-modal";

export default async function AdminRendezvenyekPage() {
  const events = await prisma.event.findMany({
    orderBy: {
      startsAt: "desc",
    },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      summary: true,
      coverImageUrl: true,
    },
  });

  return (
    <AdminShell>
      <div className="flex flex-col items-start justify-between gap-4 min-[861px]:flex-row min-[861px]:items-center">
        <h1 className={adminTitle}>Rendezvények</h1>
        <NewEventModal />
      </div>

      <div className="mt-6 grid gap-4">
        {events.map((event) => (
          <article className={`${panel} grid gap-4 p-4 min-[720px]:grid-cols-[120px_1fr] min-[720px]:items-start`} key={event.id}>
            {event.coverImageUrl ? (
              <Image
                alt=""
                className="aspect-[4/3] w-full border-2 border-charcoal object-cover"
                height={90}
                src={event.coverImageUrl}
                width={120}
              />
            ) : (
              <div className="aspect-[4/3] border-2 border-charcoal bg-surface" />
            )}
            <div>
              <p className="text-sm font-extrabold text-thread-red">
                {new Intl.DateTimeFormat("hu-RO", {
                  dateStyle: "full",
                  timeStyle: "short",
                }).format(event.startsAt)}
                {event.endsAt
                  ? ` - ${new Intl.DateTimeFormat("hu-RO", {
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(event.endsAt)}`
                  : null}
              </p>
              <h2 className="mt-2 font-serif text-2xl font-bold leading-tight">{event.title}</h2>
              <p className="mt-2 text-muted">{event.summary}</p>
            </div>
          </article>
        ))}

        {events.length === 0 ? (
          <article className={`${panel} p-5`}>
            <p className="font-extrabold text-muted">Nincs rendezvény hozzáadva.</p>
          </article>
        ) : null}
      </div>
    </AdminShell>
  );
}
