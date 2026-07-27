import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { adminTitle, buttonPrimary, panel } from "@/lib/styles";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { AdminShell } from "../admin-shell";
import { DirectorEditModal } from "./director-edit-modal";
import { DirectorPreviewTabs } from "./director-preview-tabs";
import { GroupImageUploadModal } from "./group-image-upload-modal";
import { IntroTextEditModal } from "./intro-text-edit-modal";
import { IntroTextPreviewTabs } from "./intro-text-preview-tabs";
import { MemberAdminSearchList } from "./member-admin-search-list";
import { NewMemberModal } from "./new-member-modal";

const memberCategoryNames = ["Tánckar", "Munkatársak", "Zenekar", "Alkotók"];

export default async function AdminTarsulatPage() {
  const profile = await prisma.companyProfile.findUnique({
    select: {
      directorBio: true,
      directorBioEn: true,
      directorBioRo: true,
      directorImageUrl: true,
      directorName: true,
      directorNameEn: true,
      directorNameRo: true,
      groupImageUrl: true,
      introText: true,
      introTextEn: true,
      introTextRo: true,
    },
    where: {
      id: "main",
    },
  });
  const members = await prisma.member.findMany({
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
    where: {
      name: {
        notIn: memberCategoryNames,
      },
    },
  });
  const safeMembers = members.map((member) => ({
    ...member,
    bio: member.bio ? sanitizeRichText(member.bio) : null,
    bioEn: member.bioEn ? sanitizeRichText(member.bioEn) : null,
    bioRo: member.bioRo ? sanitizeRichText(member.bioRo) : null,
  }));
  const safeIntroText = sanitizeRichText(profile?.introText ?? "");
  const safeIntroTextRo = sanitizeRichText(profile?.introTextRo ?? "");
  const safeIntroTextEn = sanitizeRichText(profile?.introTextEn ?? "");
  const safeDirectorBio = sanitizeRichText(profile?.directorBio ?? "");
  const safeDirectorBioRo = sanitizeRichText(profile?.directorBioRo ?? "");
  const safeDirectorBioEn = sanitizeRichText(profile?.directorBioEn ?? "");

  return (
    <AdminShell>
      <h1 className={adminTitle}>Rólunk</h1>
      <div className={`tarsulat-admin-actions ${panel} mt-6 grid items-start gap-3 p-5 min-[720px]:grid-cols-2 min-[1100px]:grid-cols-4`}>
        <GroupImageUploadModal />
        <div className="grid gap-2">
          <IntroTextEditModal introText={safeIntroText} />
          <div className="grid gap-2">
            <IntroTextEditModal compact introText={safeIntroTextRo} locale="ro" />
            <IntroTextEditModal compact introText={safeIntroTextEn} locale="en" />
          </div>
        </div>
        <div className="grid gap-2">
          <DirectorEditModal
            directorBio={safeDirectorBio}
            directorImageUrl={profile?.directorImageUrl ?? null}
            directorName={profile?.directorName ?? ""}
          />
          <DirectorEditModal compact directorBio={safeDirectorBioRo} directorImageUrl={profile?.directorImageUrl ?? null} directorName={profile?.directorNameRo ?? ""} locale="ro" />
          <DirectorEditModal compact directorBio={safeDirectorBioEn} directorImageUrl={profile?.directorImageUrl ?? null} directorName={profile?.directorNameEn ?? ""} locale="en" />
        </div>
        <a className={`${buttonPrimary} transition duration-200 hover:scale-105 hover:bg-white/50 hover:text-thread-red active:scale-95`} href="#tagjaink">
          Tagjaink
        </a>
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
      <IntroTextPreviewTabs introText={safeIntroText} introTextEn={safeIntroTextEn} introTextRo={safeIntroTextRo} />
      <DirectorPreviewTabs
        directorBio={safeDirectorBio}
        directorBioEn={safeDirectorBioEn}
        directorBioRo={safeDirectorBioRo}
        directorImageUrl={profile?.directorImageUrl ?? null}
        directorName={profile?.directorName ?? ""}
        directorNameEn={profile?.directorNameEn ?? ""}
        directorNameRo={profile?.directorNameRo ?? ""}
      />
      <section className="mt-10 scroll-mt-28" id="tagjaink">
        <div className="mb-5 flex flex-col items-start justify-between gap-4 min-[680px]:flex-row min-[680px]:items-center">
          <h2 className="font-serif text-[clamp(26px,3vw,38px)] font-bold leading-tight text-charcoal">Tagjaink</h2>
          <NewMemberModal />
        </div>
        <MemberAdminSearchList members={safeMembers} />
      </section>
    </AdminShell>
  );
}
