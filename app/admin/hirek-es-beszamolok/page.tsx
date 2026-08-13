import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle } from "@/lib/styles";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { NewsPostList } from "./news-post-list";
import { sortNewsPosts } from "@/lib/sort-news-posts";

export default async function AdminHirekEsBeszamolokPage() {
  const posts = await prisma.newsPost.findMany({
    select: {
      content: true,
      excerpt: true,
      id: true,
      featuredOrder: true,
      featuredUntil: true,
      locale: true,
      publishedAt: true,
      title: true,
    },
  });

  return (
    <AdminShell>
      <h1 className={adminTitle}>Hírek és beszámolók</h1>
      <NewsPostList
        posts={sortNewsPosts(posts).map((post) => ({
          ...post,
          content: sanitizeRichText(post.content),
          featuredUntil: post.featuredUntil?.toISOString() ?? null,
          publishedAt: post.publishedAt.toISOString(),
        }))}
      />
    </AdminShell>
  );
}
