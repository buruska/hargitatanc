import { prisma } from "@/lib/prisma";

export default async function HirekPage() {
  const posts = await prisma.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="page content-page">
      <p className="eyebrow">Hírek</p>
      <h1>Friss hírek és beszámolók</h1>
      <p className="lead">Itt jelenik meg az összes publikált hír időrendben.</p>
      <section className="grid two">
        {posts.map((post) => (
          <article className="card" key={post.id}>
            <span className="meta">{new Intl.DateTimeFormat("hu-RO", { dateStyle: "long" }).format(post.publishedAt)}</span>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
