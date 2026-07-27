import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { adminTitle, buttonPrimary, panel } from "@/lib/styles";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { AdminShell } from "../admin-shell";
import { DirectorEditModal } from "./director-edit-modal";
import { GroupImageUploadModal } from "./group-image-upload-modal";
import { IntroTextEditModal } from "./intro-text-edit-modal";
import { IntroTextPreviewTabs } from "./intro-text-preview-tabs";
import { MemberRowActions } from "./member-row-actions";
import { NewMemberModal } from "./new-member-modal";

const memberCategoryNames = ["Tánckar", "Munkatársak", "Zenekar", "Alkotók"];

export default async function AdminTarsulatPage() {
  const profile = await prisma.companyProfile.findUnique({
    select: {
      directorBio: true,
      directorImageUrl: true,
      directorName: true,
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
  }));
  const dancerMembers = safeMembers.filter((member) => member.role.trim().toLowerCase() === "táncos");
  const staffMembers = safeMembers.filter((member) => member.role.trim().toLowerCase() !== "táncos");
  const safeIntroText = sanitizeRichText(profile?.introText ?? "");
  const safeIntroTextRo = sanitizeRichText(profile?.introTextRo ?? "");
  const safeIntroTextEn = sanitizeRichText(profile?.introTextEn ?? "");
  const safeDirectorBio = sanitizeRichText(profile?.directorBio ?? "");

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
        <DirectorEditModal
          directorBio={safeDirectorBio}
          directorImageUrl={profile?.directorImageUrl ?? null}
          directorName={profile?.directorName ?? ""}
        />
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
              {safeDirectorBio ? (
                <div className="rich-text-editor" dangerouslySetInnerHTML={{ __html: safeDirectorBio }} />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      <section className="mt-10 scroll-mt-28" id="tagjaink">
        <div className="mb-5 flex flex-col items-start justify-between gap-4 min-[680px]:flex-row min-[680px]:items-center">
          <h2 className="font-serif text-[clamp(26px,3vw,38px)] font-bold leading-tight text-charcoal">Tagjaink</h2>
          <NewMemberModal />
        </div>
        <div className="grid gap-6">
          <MemberListSection emptyText="Még nincsenek táncosok rögzítve." members={dancerMembers} title="Tánckar" />
          <MemberListSection emptyText="Még nincsenek munkatársak rögzítve." members={staffMembers} title="Munkatársak" />
        </div>
      </section>
    </AdminShell>
  );
}

type MemberListItem = {
  bio: string | null;
  id: string;
  imageUrl: string | null;
  name: string;
  role: string;
};

function MemberListSection({
  emptyText,
  members,
  title,
}: {
  emptyText: string;
  members: MemberListItem[];
  title: string;
}) {
  return (
    <section className={`${panel} p-5`}>
      <h3 className="mb-4 font-serif text-2xl font-bold leading-tight text-charcoal">{title}</h3>
      {members.length > 0 ? (
        <div className="grid gap-4">
          {members.map((member, index) => (
            <article
              className="grid gap-4 border-t border-line pt-4 first:border-t-0 first:pt-0 min-[780px]:grid-cols-[86px_minmax(0,1fr)_auto]"
              key={member.id}
            >
              {member.imageUrl ? (
                <Image
                  alt={`${member.name} portré`}
                  className="aspect-square w-full max-w-[86px] border-2 border-line-strong object-cover"
                  height={86}
                  src={member.imageUrl}
                  width={86}
                />
              ) : (
                <div className="grid aspect-square w-full max-w-[86px] place-items-center border-2 border-line-strong bg-surface-strong font-serif text-3xl font-bold text-thread-red">
                  {member.name.charAt(0)}
                </div>
              )}
              <div className="grid content-center">
                <h4 className="font-serif text-2xl font-bold leading-tight text-charcoal">{member.name}</h4>
                <p className="text-sm font-extrabold text-thread-red">{member.role}</p>
              </div>
              <div className="self-center">
                <MemberRowActions
                  canMoveDown={index < members.length - 1}
                  canMoveUp={index > 0}
                  member={member}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm font-extrabold text-muted">{emptyText}</p>
      )}
    </section>
  );
}
