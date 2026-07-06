import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { adminTitle, buttonPrimary, panel } from "@/lib/styles";
import { AdminShell } from "../admin-shell";
import { DirectorEditModal } from "./director-edit-modal";
import { GroupImageUploadModal } from "./group-image-upload-modal";
import { IntroTextEditModal } from "./intro-text-edit-modal";
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
  const dancerMembers = members.filter((member) => member.role.trim().toLowerCase() === "táncos");
  const staffMembers = members.filter((member) => member.role.trim().toLowerCase() !== "táncos");

  return (
    <AdminShell>
      <h1 className={adminTitle}>Rólunk</h1>
      <div className={`${panel} mt-6 grid gap-3 p-5 min-[720px]:grid-cols-4`}>
        <GroupImageUploadModal />
        <IntroTextEditModal introText={profile?.introText ?? ""} />
        <DirectorEditModal
          directorBio={profile?.directorBio ?? ""}
          directorImageUrl={profile?.directorImageUrl ?? null}
          directorName={profile?.directorName ?? ""}
        />
        <a className={buttonPrimary} href="#tagjaink">
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
