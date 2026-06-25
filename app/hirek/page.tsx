import { prisma } from "@/lib/prisma";
import { card, contentPage, eyebrow, gridTwo, h1, h2, leadSpaced, meta } from "@/lib/styles";

export default async function HirekPage() {
  const posts = await prisma.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className={contentPage}>
      <p className={eyebrow}>Hírek</p>
      <h1 className={h1}>Friss hírek és beszámolók</h1>
      <p className={leadSpaced}>Itt jelenik meg az összes publikált hír időrendben.</p>
      <section className={gridTwo}>
        {posts.map((post) => (
          <article className={card} key={post.id}>
            <span className={meta}>{new Intl.DateTimeFormat("hu-RO", { dateStyle: "long" }).format(post.publishedAt)}</span>
            <h2 className={h2}>{post.title}</h2>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
