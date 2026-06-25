import { prisma } from "@/lib/prisma";
import { card, contentPage, eyebrow, gridTwo, h1, h2, leadSpaced, meta } from "@/lib/styles";

export default async function EsemenyeinkPage() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });

  return (
    <main className={contentPage}>
      <p className={eyebrow}>Eseményeink</p>
      <h1 className={h1}>Előadások és rendezvények</h1>
      <p className={leadSpaced}>
        A közelgő előadások és rendezvények elsőként jelennek meg, az archív beszámolók külön blokkba kerülnek majd.
      </p>
      <section className={gridTwo}>
        {events.map((event) => (
          <article className={card} key={event.id}>
            <time className={meta}>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "full", timeStyle: "short" }).format(event.startsAt)}</time>
            <h2 className={h2}>{event.title}</h2>
            <p>{event.summary}</p>
            <p className={meta}>{event.location}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
