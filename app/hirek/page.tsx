import { prisma } from "@/lib/prisma";
import { NewsSearchList } from "./news-search-list";
import { getLocale } from "@/lib/i18n";
import { sortNewsPosts } from "@/lib/sort-news-posts";
import { getSiteTextMap } from "@/lib/site-texts";

function getFirstImageSrc(value: string) {
  return value.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? "/logo.png";
}

export default async function HirekPage() {
  const locale = await getLocale();
  const siteTexts = await getSiteTextMap(locale);
  const heading = { eyebrow: siteTexts["news.eyebrow"], title: siteTexts["news.title"] };
  const posts = await prisma.newsPost.findMany({
    where: { locale },
    select: {
      content: true,
      excerpt: true,
      id: true,
      featuredOrder: true,
      featuredUntil: true,
      publishedAt: true,
      slug: true,
      title: true,
    },
  });
  const newsPosts = sortNewsPosts(posts).map((post) => ({
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
