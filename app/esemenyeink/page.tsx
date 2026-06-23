import { prisma } from "@/lib/prisma";

export default async function EsemenyeinkPage() {
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });

  return (
    <main className="page content-page">
      <p className="eyebrow">Eseményeink</p>
      <h1>Előadások és rendezvények</h1>
      <p className="lead">
        A közelgő előadások és rendezvények elsőként jelennek meg, az archív beszámolók külön blokkba kerülnek majd.
      </p>
      <section className="grid two">
        {events.map((event) => (
          <article className="card" key={event.id}>
            <time>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "full", timeStyle: "short" }).format(event.startsAt)}</time>
            <h2>{event.title}</h2>
            <p>{event.summary}</p>
            <p className="meta">{event.location}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
