import { meta } from "@/lib/styles";

type PerformanceEvent = {
  id: string;
  startsAt: string;
  location: string;
  ticketUrl: string;
};

type PerformanceEventsToggleProps = {
  events: PerformanceEvent[];
};

const dateFormatter = new Intl.DateTimeFormat("hu-RO", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "Europe/Bucharest",
});

export function PerformanceEventsToggle({ events }: PerformanceEventsToggleProps) {
  return (
    <div className="mt-4">
      <p className={meta}>Fellépések:</p>
      {events.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {events.map((event) => (
            <a
              className="inline-flex min-h-9 items-center border border-line bg-surface-strong px-3 py-2 text-sm font-extrabold text-petrol transition hover:border-charcoal hover:bg-thread-red hover:text-surface-strong"
              href={event.ticketUrl}
              key={event.id}
              rel="noreferrer"
              target="_blank"
            >
              {dateFormatter.format(new Date(event.startsAt))} · {event.location}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm font-extrabold text-muted">Ehhez az előadáshoz még nincs fellépés hozzáadva.</p>
      )}
    </div>
  );
}
