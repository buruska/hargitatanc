import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { adminTitle, buttonPrimary, panel } from "@/lib/styles";
import { AdminShell } from "../admin-shell";
import { GroupImageUploadModal } from "./group-image-upload-modal";

export default async function AdminTarsulatPage() {
  const profile = await prisma.companyProfile.findUnique({
    select: {
      groupImageUrl: true,
    },
    where: {
      id: "main",
    },
  });

  return (
    <AdminShell>
      <h1 className={adminTitle}>Társulat</h1>
      <div className={`${panel} mt-6 grid gap-3 p-5 min-[720px]:grid-cols-3`}>
        <GroupImageUploadModal />
        <button className={buttonPrimary} type="button">
          Bemutató szöveg módosítása
        </button>
        <button className={buttonPrimary} type="button">
          Igazgató adatainak módosítása
        </button>
      </div>
      {profile?.groupImageUrl ? (
        <div className={`${panel} mt-6 w-full max-w-[360px] p-4`}>
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.1em] text-thread-red">Aktuális csoportkép</p>
          <Image
            alt="Társulat csoportkép"
            className="aspect-[16/10] w-full border-2 border-line-strong object-cover"
            height={225}
            src={profile.groupImageUrl}
            width={360}
          />
        </div>
      ) : null}
    </AdminShell>
  );
}
