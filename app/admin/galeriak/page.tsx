import Image from "next/image";
import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle, panel } from "@/lib/styles";
import { EditGalleryModal } from "./edit-gallery-modal";
import { DeleteGalleryModal } from "./delete-gallery-modal";
import { toggleGalleryPublicationAction } from "./actions";

export default async function AdminGaleriakPage() {
  const galleries = await prisma.runningPerformance.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      coverImageUrl: true,
      galleryImages: {
        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
        select: {
          id: true,
          imageUrl: true,
        },
      },
      galleryIsPublished: true,
      id: true,
      title: true,
    },
    where: {
      galleryImages: {
        some: {},
      },
    },
  });

  return (
    <AdminShell>
      <h1 className={adminTitle}>Galériák</h1>

      <div className="mt-6 grid gap-4">
        {galleries.map((gallery) => (
          <article
            className={`${panel} grid gap-4 p-4 min-[720px]:grid-cols-[112px_1fr] min-[720px]:items-center`}
            key={gallery.id}
          >
            <Image
              alt=""
              className="aspect-[4/3] w-full border-2 border-charcoal object-cover"
              height={84}
              src={gallery.coverImageUrl}
              width={112}
            />
            <div className="flex flex-col gap-3 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold leading-tight">{gallery.title}</h2>
                <p className="mt-1 text-sm font-extrabold text-muted">
                  {gallery.galleryImages.length} kép · {gallery.galleryIsPublished ? "Publikálva" : "Elrejtve"}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <form action={toggleGalleryPublicationAction}>
                  <input name="id" type="hidden" value={gallery.id} />
                  <input name="galleryIsPublished" type="hidden" value={String(!gallery.galleryIsPublished)} />
                  <button
                    className={`inline-flex min-h-8 items-center justify-center border px-3 py-1.5 text-xs font-extrabold transition ${
                      gallery.galleryIsPublished
                        ? "border-line bg-surface-strong text-muted hover:border-charcoal hover:bg-surface"
                        : "border-[rgb(49_90_59_/_55%)] bg-[rgb(49_90_59_/_12%)] text-pine hover:bg-[rgb(49_90_59_/_20%)] hover:text-charcoal"
                    }`}
                    type="submit"
                  >
                    {gallery.galleryIsPublished ? "Elrejtés" : "Publikálás"}
                  </button>
                </form>
                <EditGalleryModal
                  coverImageUrl={gallery.coverImageUrl}
                  id={gallery.id}
                  images={gallery.galleryImages}
                  title={gallery.title}
                />
                <DeleteGalleryModal id={gallery.id} title={gallery.title} />
              </div>
            </div>
          </article>
        ))}

        {galleries.length === 0 ? (
          <article className={`${panel} p-5`}>
            <p className="font-extrabold text-muted">Nincs galéria feltöltve.</p>
          </article>
        ) : null}
      </div>
    </AdminShell>
  );
}
