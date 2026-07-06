import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle, panel } from "@/lib/styles";
import { NewsPostActions } from "./news-post-actions";

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

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

      <div className="mt-6 grid gap-4">
        {posts.map((post, index) => {
          const preview = stripHtml(post.content);

          return (
            <article className={`${panel} p-5`} key={post.id}>
              <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-thread-red">
                    {new Intl.DateTimeFormat("hu-RO", {
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(post.publishedAt)}
                  </p>
                  <h2 className="mt-2 font-serif text-2xl font-bold leading-tight">{post.title}</h2>
                </div>
                <NewsPostActions
                  content={post.content}
                  excerpt={post.excerpt}
                  id={post.id}
                  isFirst={index === 0}
                  isLast={index === posts.length - 1}
                  publishedAt={post.publishedAt.toISOString()}
                  title={post.title}
                />
              </div>
              {post.excerpt ? <p className="mt-1 text-sm font-extrabold text-petrol">{post.excerpt}</p> : null}
              {preview ? <p className="mt-3 line-clamp-3 text-muted">{preview}</p> : null}
            </article>
          );
        })}

        {posts.length === 0 ? (
          <article className={`${panel} p-5`}>
            <p className="font-extrabold text-muted">Még nincs feltöltött hír vagy beszámoló.</p>
          </article>
        ) : null}
      </div>
    </AdminShell>
  );
}
