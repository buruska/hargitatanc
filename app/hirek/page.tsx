import { prisma } from "@/lib/prisma";
import { NewsSearchList } from "./news-search-list";
import { getLocale } from "@/lib/i18n";

function getFirstImageSrc(value: string) {
  return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? "/logo.png";
}

export default async function HirekPage() {
  const locale = await getLocale();
  const heading = locale === "ro" ? { eyebrow: "Actualitate", title: "Știri și relatări" } : locale === "en" ? { eyebrow: "Latest", title: "News and reports" } : { eyebrow: "Aktuális", title: "Hírek és beszámolók" };
  const posts = await prisma.newsPost.findMany({
    where: { locale },
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
    <main className="mx-auto w-[calc(100%-36px)] pb-[72px] pt-[124px] md:w-[80vw]">
      <NewsSearchList heading={heading} locale={locale} posts={newsPosts} />
    </main>
  );
}
