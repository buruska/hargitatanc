import { eyebrow, h1 } from "@/lib/styles";
import { prisma } from "@/lib/prisma";
import { GalleryPerformanceCards } from "./gallery-performance-cards";

export default async function GaleriaPage() {
  const performances = await prisma.runningPerformance.findMany({
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
      <h1 className={h1}>Előadásképek és albumok</h1>
      <GalleryPerformanceCards performances={performances} />
    </main>
  );
}
