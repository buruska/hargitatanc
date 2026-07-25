import { eyebrow, h1 } from "@/lib/styles";
import { prisma } from "@/lib/prisma";
import { GalleryPerformanceCards } from "./gallery-performance-cards";
import { getLocale } from "@/lib/i18n";

export default async function GaleriaPage() {
  const locale = await getLocale();
  const title = locale === "ro" ? "Fotografii de spectacol și albume" : locale === "en" ? "Performance photos and albums" : "Előadásképek és albumok";
  const performances = await prisma.runningPerformance.findMany({
    orderBy: [
      {
        gallerySortOrder: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
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
      id: true,
      title: true,
    },
    where: {
      galleryIsPublished: true,
      galleryImages: {
        some: {},
      },
    },
  });

  return (
    <main className="min-h-[calc(100vh-101px)] bg-warm-canvas px-[clamp(18px,4vw,56px)] pb-[72px] pt-[124px] text-charcoal supports-[height:100dvh]:min-h-[calc(100dvh-101px)]">
      <p className={eyebrow}>Galéria</p>
      <h1 className={h1}>{title}</h1>
      <GalleryPerformanceCards performances={performances} />
    </main>
  );
}
