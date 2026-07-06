import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { adminTitle, panel } from "@/lib/styles";
import { AdminShell } from "../admin-shell";
import { DirectorEditModal } from "./director-edit-modal";
import { GroupImageUploadModal } from "./group-image-upload-modal";
import { IntroTextEditModal } from "./intro-text-edit-modal";

export default async function AdminTarsulatPage() {
  const profile = await prisma.companyProfile.findUnique({
    select: {
      directorBio: true,
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
    <AdminShell>
      <h1 className={adminTitle}>Rólunk</h1>
      <div className={`${panel} mt-6 grid gap-3 p-5 min-[720px]:grid-cols-3`}>
        <GroupImageUploadModal />
        <IntroTextEditModal introText={profile?.introText ?? ""} />
        <DirectorEditModal
          directorBio={profile?.directorBio ?? ""}
          directorImageUrl={profile?.directorImageUrl ?? null}
          directorName={profile?.directorName ?? ""}
        />
      </div>
      {profile?.groupImageUrl ? (
        <div className={`${panel} mt-6 w-full max-w-[360px] p-4`}>
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.1em] text-thread-red">Aktuális csoportkép</p>
          <Image
            alt="Rólunk csoportkép"
            className="aspect-[16/10] w-full border-2 border-line-strong object-cover"
            height={225}
            src={profile.groupImageUrl}
            width={360}
          />
        </div>
      ) : null}
      {profile?.introText ? (
        <div className={`${panel} mt-6 p-5`}>
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.1em] text-thread-red">Aktuális bemutató szöveg</p>
          <div
            className="rich-text-editor text-[15px] font-bold leading-relaxed text-muted"
            dangerouslySetInnerHTML={{ __html: profile.introText }}
          />
        </div>
      ) : null}
      {profile?.directorName || profile?.directorBio || profile?.directorImageUrl ? (
        <div className={`${panel} mt-6 p-5`}>
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.1em] text-thread-red">Aktuális igazgatói adatok</p>
          <div className="grid gap-4 min-[680px]:grid-cols-[180px_1fr]">
            {profile.directorImageUrl ? (
              <Image
                alt={profile.directorName ? `${profile.directorName} igazgató` : "Igazgatói kép"}
                className="aspect-[4/3] w-full max-w-[220px] border-2 border-line-strong object-cover"
                height={135}
                src={profile.directorImageUrl}
                width={180}
              />
            ) : null}
            <div className="text-[15px] font-bold leading-relaxed text-muted">
              {profile.directorName ? <h2 className="mb-2 font-serif text-2xl font-bold text-charcoal">{profile.directorName}</h2> : null}
              {profile.directorBio ? (
                <div className="rich-text-editor" dangerouslySetInnerHTML={{ __html: profile.directorBio }} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
