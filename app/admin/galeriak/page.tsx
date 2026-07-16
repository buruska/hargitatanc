import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle } from "@/lib/styles";
import { GalleryList } from "./gallery-list";

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
      <GalleryList galleries={galleries} />
    </AdminShell>
  );
}
