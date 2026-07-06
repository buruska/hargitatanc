import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { contentPage, eyebrow, h1 } from "@/lib/styles";

export default async function TarsulatPage() {
  const profile = await prisma.companyProfile.findUnique({
    select: {
      groupImageUrl: true,
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
            className="w-full max-w-[820px] border-2 border-line-strong object-cover shadow-[12px_12px_0_rgb(33_31_27_/_14%)]"
            height={520}
            src={profile.groupImageUrl}
            width={820}
          />
        </div>
      ) : null}
    </main>
  );
}
