import { HeroCoverCarousel } from "./hero-cover-carousel";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const performances = await prisma.runningPerformance.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
    },
  });

  return (
    <main>
      <HeroCoverCarousel covers={performances} />

      <section className="bg-surface px-[clamp(18px,4vw,56px)] py-16 text-charcoal">
        <div className="mx-auto max-w-[860px] space-y-6 text-[18px] leading-8">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae arcu sed nulla porta
            tincidunt. Donec volutpat, sem id facilisis luctus, metus mi fermentum lectus, sed dapibus
            ipsum neque vitae lorem.
          </p>
          <p>
            Praesent ac nibh at velit feugiat posuere. Morbi consequat, augue at dignissim luctus, turpis
            lacus gravida risus, vitae luctus enim justo id mi. Curabitur sed lectus nec erat pulvinar
            placerat.
          </p>
          <p>
            Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
            cubilia curae; Aliquam erat volutpat. Etiam rhoncus, lectus at convallis porta, justo nibh
            suscipit nisl, id blandit tortor mi sed lectus.
          </p>
          <p>
            Nulla facilisi. Sed ut felis eu augue efficitur tincidunt. Maecenas tempus turpis id mauris
            hendrerit, vitae dictum lorem pretium. Integer nec orci at risus volutpat dignissim non at
            arcu.
          </p>
          <p>
            Vivamus a tellus gravida, placerat mauris non, ultricies lorem. Donec aliquet lorem in tortor
            faucibus, ac commodo turpis blandit. Proin vel neque et sem egestas vestibulum sit amet at
            lacus.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae arcu sed nulla porta
            tincidunt. Donec volutpat, sem id facilisis luctus, metus mi fermentum lectus, sed dapibus
            ipsum neque vitae lorem.
          </p>
          <p>
            Praesent ac nibh at velit feugiat posuere. Morbi consequat, augue at dignissim luctus, turpis
            lacus gravida risus, vitae luctus enim justo id mi. Curabitur sed lectus nec erat pulvinar
            placerat.
          </p>
          <p>
            Suspendisse potenti. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
            cubilia curae; Aliquam erat volutpat. Etiam rhoncus, lectus at convallis porta, justo nibh
            suscipit nisl, id blandit tortor mi sed lectus.
          </p>
          <p>
            Nulla facilisi. Sed ut felis eu augue efficitur tincidunt. Maecenas tempus turpis id mauris
            hendrerit, vitae dictum lorem pretium. Integer nec orci at risus volutpat dignissim non at
            arcu.
          </p>
          <p>
            Vivamus a tellus gravida, placerat mauris non, ultricies lorem. Donec aliquet lorem in tortor
            faucibus, ac commodo turpis blandit. Proin vel neque et sem egestas vestibulum sit amet at
            lacus.
          </p>
        </div>
      </section>
    </main>
  );
}
