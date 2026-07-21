import { prisma } from "@/lib/prisma";
import { adminTitle } from "@/lib/styles";
import { AdminShell } from "../admin-shell";
import { AppearanceGauge, PerformanceGauge } from "./appearance-gauge";
import { DatesModal } from "./dates-modal";
import { LocationsModal } from "./locations-modal";

const calendarDayFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Bucharest",
  year: "numeric",
});

export default async function AdminStatisztikakPage() {
  const now = new Date();
  const [totalAppearances, completedAppearances, performances, locations] = await Promise.all([
    prisma.runningPerformanceEvent.count(),
    prisma.runningPerformanceEvent.count({
      where: {
        startsAt: { lt: now },
      },
    }),
    prisma.runningPerformance.findMany({
      where: { isGalleryOnly: false },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        events: {
          select: { startsAt: true },
        },
      },
    }),
    prisma.runningPerformanceEvent.findMany({
      distinct: ["location"],
      where: { location: { not: "" } },
      orderBy: { location: "asc" },
      select: { location: true },
    }),
  ]);

  const completedPercentage =
    totalAppearances === 0 ? 0 : Math.round((completedAppearances / totalAppearances) * 100);
  const appearanceDates = performances
    .flatMap((performance) =>
      performance.events
        .map((event, index) => ({
          id: `${performance.id}-${event.startsAt.toISOString()}-${index}`,
          startsAt: event.startsAt,
          title: performance.title,
        })),
    )
    .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime());
  const uniqueAppearanceDays = new Set(
    appearanceDates.map((appearance) => calendarDayFormatter.format(appearance.startsAt)),
  ).size;
  return (
    <AdminShell>
      <h1 className={adminTitle}>Statisztikák</h1>

      <section className="mt-6 grid items-center gap-12 py-6 min-[700px]:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] min-[700px]:gap-8 min-[700px]:py-10">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-muted">Fellépések állapota</h2>
          <AppearanceGauge
            completedAppearances={completedAppearances}
            completedPercentage={completedPercentage}
            totalAppearances={totalAppearances}
          />
          {totalAppearances === 0 ? (
            <p className="mt-5 text-sm font-bold text-muted">
              A százalék a fellépések hozzáadása után jelenik meg.
            </p>
          ) : null}
        </div>

        <div className="border-t border-line pt-8 min-[700px]:border-l min-[700px]:border-t-0 min-[700px]:pl-8 min-[700px]:pt-0">
          <p className="mb-6 text-center text-sm font-extrabold uppercase tracking-[0.16em] text-muted min-[700px]:text-left">
            Darabokra lebontva
          </p>
          <div className="grid gap-6">
            {performances.map((performance) => {
              const total = performance.events.length;
              const completed = performance.events.filter((event) => event.startsAt < now).length;
              const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

              return (
                <PerformanceGauge
                  completedAppearances={completed}
                  completedPercentage={percentage}
                  key={performance.id}
                  title={performance.title}
                  totalAppearances={total}
                />
              );
            })}
          </div>

          {performances.length === 0 ? (
            <p className="text-center text-sm font-bold text-muted min-[700px]:text-left">
              Még nincs futó darab hozzáadva.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-6 flex flex-col items-start justify-between gap-5 border-t border-line py-8 min-[560px]:flex-row min-[560px]:items-center">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-muted">Fellépési helyszínek</p>
          <p className="mt-2 font-serif text-[clamp(28px,4vw,40px)] font-bold leading-none">
            {locations.length} helyszín
          </p>
        </div>
        <LocationsModal locations={locations.map((location) => location.location)} />
      </section>

      <section className="flex flex-col items-start justify-between gap-5 border-t border-line py-8 min-[560px]:flex-row min-[560px]:items-center">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-muted">Fellépési dátumok</p>
          <p className="mt-2 font-serif text-[clamp(28px,4vw,40px)] font-bold leading-none">
            {uniqueAppearanceDays} dátum
          </p>
        </div>
        <DatesModal
          appearances={appearanceDates.map((appearance) => ({
            ...appearance,
            startsAt: appearance.startsAt.toISOString(),
          }))}
        />
      </section>
    </AdminShell>
  );
}
