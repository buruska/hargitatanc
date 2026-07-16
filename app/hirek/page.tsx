import { prisma } from "@/lib/prisma";
import { eyebrow, h1 } from "@/lib/styles";
import { NewsSearchList } from "./news-search-list";

function getFirstImageSrc(value: string) {
  return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
}

export default async function HirekPage() {
  const posts = await prisma.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
    select: {
      content: true,
      excerpt: true,
      id: true,
      publishedAt: true,
      slug: true,
      title: true,
    },
  });
  const newsPosts = posts.map((post) => ({
    excerpt: post.excerpt,
    id: post.id,
    imageSrc: getFirstImageSrc(post.content),
    publishedAt: post.publishedAt.toISOString(),
    slug: post.slug,
    title: post.title,
  }));

  return (
    <main className="mx-auto max-w-[1180px] px-[clamp(18px,4vw,56px)] pb-[72px] pt-[124px]">
      <p className={eyebrow}>Hírek</p>
      <h1 className={h1}>Friss hírek és beszámolók</h1>
      <NewsSearchList posts={newsPosts} />
    </main>
  );
}
