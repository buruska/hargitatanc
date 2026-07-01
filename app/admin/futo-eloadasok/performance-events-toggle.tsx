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
  const now = new Date();
  const upcomingEvents = events.filter((event) => new Date(event.startsAt) >= now);
  const expiredEvents = events.filter((event) => new Date(event.startsAt) < now);

  return (
    <div className="mt-4">
      {events.length > 0 ? (
        <div className="grid gap-4 min-[720px]:grid-cols-2">
          <EventColumn events={upcomingEvents} title="Aktuális fellépések" showHoverActions />
          <EventColumn events={expiredEvents} title="Lejárt fellépések" showUploadAction muted />
        </div>
      ) : (
        <p className="text-sm font-extrabold text-muted">Ehhez az előadáshoz még nincs fellépés hozzáadva.</p>
      )}
    </div>
  );
}

function EventColumn({
  events,
  muted = false,
  showHoverActions = false,
  showUploadAction = false,
  title,
}: Readonly<{
  events: PerformanceEvent[];
  muted?: boolean;
  showHoverActions?: boolean;
  showUploadAction?: boolean;
  title: string;
}>) {
  return (
    <div>
      <p className={`mb-2 text-xs font-extrabold uppercase tracking-normal ${muted ? "text-muted" : "text-petrol"}`}>{title}:</p>
      {events.length > 0 ? (
        <div className="grid gap-1.5">
          {events.map((event) => (
            <EventButton
              event={event}
              key={event.id}
              muted={muted}
              showHoverActions={showHoverActions}
              showUploadAction={showUploadAction}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs font-extrabold text-muted">Nincs ilyen fellépés.</p>
      )}
    </div>
  );
}

function EventButton({
  event,
  muted,
  showHoverActions,
  showUploadAction,
}: Readonly<{ event: PerformanceEvent; muted: boolean; showHoverActions: boolean; showUploadAction: boolean }>) {
  const content = `${dateFormatter.format(new Date(event.startsAt))} · ${event.location}`;
  const baseClass =
    "flex min-h-[22px] w-full items-center border border-line bg-surface-strong px-2 py-0.5 text-xs font-extrabold transition";

  if (showHoverActions) {
    return (
      <div className={`${baseClass} group justify-between overflow-hidden text-petrol`}>
        {event.ticketUrl ? (
          <a
            className="truncate group-hover:hidden"
            href={event.ticketUrl}
            rel="noreferrer"
            target="_blank"
          >
            {content}
          </a>
        ) : (
          <span className="truncate text-muted group-hover:hidden">{content}</span>
        )}
        <div className="hidden w-full grid-cols-2 gap-1 group-hover:grid">
          <button
            className="min-h-4 border-0 bg-[rgb(20_97_106_/_8%)] px-0 py-0 text-xs font-extrabold leading-none text-petrol hover:bg-[rgb(20_97_106_/_14%)] hover:text-charcoal"
            type="button"
          >
            Módosítás
          </button>
          <button
            className="min-h-4 border-0 bg-[rgb(179_38_32_/_8%)] px-0 py-0 text-xs font-extrabold leading-none text-thread-red hover:bg-[rgb(179_38_32_/_14%)] hover:text-charcoal"
            type="button"
          >
            Törlés
          </button>
        </div>
      </div>
    );
  }

  if (showUploadAction) {
    return (
      <div className={`${baseClass} group justify-between overflow-hidden text-muted`}>
        <span className="truncate group-hover:hidden">{content}</span>
        <button
          className="hidden min-h-4 w-full border-0 bg-[rgb(20_97_106_/_8%)] px-0 py-0 text-xs font-extrabold leading-none text-petrol hover:bg-[rgb(20_97_106_/_14%)] hover:text-charcoal group-hover:block"
          type="button"
        >
          Képek feltöltése
        </button>
      </div>
    );
  }

  if (!event.ticketUrl) {
    return <span className={`${baseClass} text-muted`}>{content}</span>;
  }

  return (
    <a
      className={`${baseClass} ${
        muted ? "text-muted hover:border-charcoal hover:text-charcoal" : "text-petrol hover:border-charcoal hover:bg-thread-red hover:text-surface-strong"
      }`}
      href={event.ticketUrl}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  );
}
