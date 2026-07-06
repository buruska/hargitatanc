import Image from "next/image";
import { HomeRevealGroup } from "../home-reveal-group";
import { prisma } from "@/lib/prisma";
import { contentPage, eyebrow, h1 } from "@/lib/styles";

export default async function TarsulatPage() {
  const profile = await prisma.companyProfile.findUnique({
    select: {
      directorImageUrl: true,
      directorName: true,
      groupImageUrl: true,
      introText: true,
    },
    where: {
      id: "main",
    },
  });

  return (
    <main className={contentPage}>
      <p className={eyebrow}>Rólunk</p>
      <h1 className={`${h1} mb-48`}>Hargita Székely Néptáncszínház</h1>
      {profile?.groupImageUrl ? (
        <div className="mt-10 flex justify-center">
          <Image
            alt="Hargita Székely Néptáncszínház csoportkép"
            className="w-full max-w-[902px] border-2 border-line-strong object-cover shadow-[12px_12px_0_rgb(33_31_27_/_14%)]"
            height={572}
            src={profile.groupImageUrl}
            width={902}
          />
        </div>
      ) : null}
      {profile?.introText ? (
        <HomeRevealGroup className="home-reveal-group mt-24">
          <section className="relative left-1/2 w-[90vw] -translate-x-1/2">
            <div
              className={`grid items-start gap-10 ${
                profile.directorImageUrl ? "min-[980px]:grid-cols-[minmax(0,1fr)_minmax(240px,340px)]" : ""
              }`}
            >
              <div
                className="about-intro-reveal rich-text-editor text-[clamp(18px,2vw,22px)] font-bold leading-relaxed text-charcoal"
                dangerouslySetInnerHTML={{ __html: profile.introText }}
              />
              {profile.directorImageUrl ? (
                <figure className="group about-director-reveal relative mb-14 w-full max-w-[340px] justify-self-end border-2 border-line-strong shadow-[12px_12px_0_rgb(33_31_27_/_14%)]">
                  <div className="overflow-hidden">
                    <Image
                      alt={profile.directorName ? `${profile.directorName} igazgató` : "Igazgató"}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      height={425}
                      src={profile.directorImageUrl}
                      width={340}
                    />
                  </div>
                  {profile.directorName ? (
                    <figcaption className="absolute -bottom-12 left-2.5 w-full shadow-[8px_8px_0_rgb(33_31_27_/_12%)] transition-all duration-300 ease-out group-hover:bottom-0 group-hover:left-0 group-hover:shadow-none">
                      <span className="relative block bg-thread-red px-4 py-3 text-center font-sans text-[clamp(16px,2vw,20px)] font-extrabold leading-tight text-surface-strong">
                        <span className="block transition-opacity duration-200 group-hover:opacity-0">{profile.directorName}</span>
                        <span className="absolute inset-x-4 top-1/2 block -translate-y-1/2 text-sm tracking-[0.18em] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          BŐVEBBEN
                        </span>
                      </span>
                      <span className="block max-h-10 w-full overflow-hidden bg-surface-strong px-4 py-2 text-center font-serif text-sm font-bold leading-tight text-thread-red transition-all duration-300 ease-out group-hover:max-h-0 group-hover:py-0 group-hover:opacity-0">
                        igazgató
                      </span>
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </div>
          </section>
        </HomeRevealGroup>
      ) : null}
    </main>
  );
}
