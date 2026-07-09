import Image from "next/image";
import { AdminShell } from "../admin-shell";
import { adminTitle, panel } from "@/lib/styles";
import { prisma } from "@/lib/prisma";
import { moveDefaultCoverAction } from "./actions";
import { DeleteDefaultCoverModal } from "./delete-default-cover-modal";
import { DefaultCoverUploadForm } from "./default-cover-upload-form";

export default async function AdminAlapbeallitasokPage() {
  const defaultCoverImages = await prisma.defaultCoverImage.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return (
    <AdminShell>
      <h1 className={adminTitle}>Alapbeállítások</h1>
      <section className={`${panel} grid gap-5 p-5`}>
        <div>
          <h2 className="font-serif text-[clamp(22px,2.2vw,28px)] font-bold leading-[1.08]">Alap borítóképek</h2>
          <p className="mt-2 text-sm font-bold text-muted">
            Ezek a képek csak akkor jelennek meg a főoldali borítóban, ha nincs feltöltött játszott darab és rendezvény.
          </p>
        </div>

        <DefaultCoverUploadForm />

        {defaultCoverImages.length > 0 ? (
          <div className="grid gap-3">
            {defaultCoverImages.map((coverImage, index) => (
              <article className="grid gap-3 border border-line bg-surface-strong p-3 min-[620px]:grid-cols-[112px_1fr] min-[620px]:items-center" key={coverImage.id}>
                <Image
                  alt=""
                  className="aspect-[16/10] w-full border-2 border-line-strong object-cover"
                  height={70}
                  src={coverImage.imageUrl}
                  width={112}
                />
                <div className="flex flex-col gap-3 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between">
                  <p className="truncate text-sm font-bold text-muted">{coverImage.imageUrl}</p>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <form action={moveDefaultCoverAction}>
                      <input name="id" type="hidden" value={coverImage.id} />
                      <input name="direction" type="hidden" value="up" />
                      <button
                        className="inline-flex min-h-9 items-center justify-center border border-line bg-surface px-3 py-1.5 text-xs font-extrabold text-pine transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-45"
                        type="submit"
                        disabled={index === 0}
                      >
                        Fel
                      </button>
                    </form>
                    <form action={moveDefaultCoverAction}>
                      <input name="id" type="hidden" value={coverImage.id} />
                      <input name="direction" type="hidden" value="down" />
                      <button
                        className="inline-flex min-h-9 items-center justify-center border border-line bg-surface px-3 py-1.5 text-xs font-extrabold text-pine transition hover:border-charcoal hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-45"
                        type="submit"
                        disabled={index === defaultCoverImages.length - 1}
                      >
                        Le
                      </button>
                    </form>
                    <DeleteDefaultCoverModal id={coverImage.id} imageUrl={coverImage.imageUrl} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="border border-line bg-surface-strong px-4 py-3 text-sm font-extrabold text-muted">
            Még nincs feltöltött alap borítókép.
          </p>
        )}
      </section>
    </AdminShell>
  );
}
