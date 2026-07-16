import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle } from "@/lib/styles";
import { NewsPostList } from "./news-post-list";

export default async function AdminHirekEsBeszamolokPage() {
  const posts = await prisma.newsPost.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    select: {
      content: true,
      excerpt: true,
      id: true,
      publishedAt: true,
      title: true,
    },
  });

  return (
    <AdminShell>
      <h1 className={adminTitle}>Hírek és beszámolók</h1>
      <NewsPostList posts={posts.map((post) => ({ ...post, publishedAt: post.publishedAt.toISOString() }))} />
    </AdminShell>
  );
}
