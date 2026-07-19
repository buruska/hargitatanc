import Image from "next/image";
import { HomeRevealGroup } from "../home-reveal-group";
import { prisma } from "@/lib/prisma";
import { contentPage, eyebrow, h1 } from "@/lib/styles";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { DirectorProfileCard } from "./director-profile-card";
import { MemberSearchList } from "./member-search-list";

const MEMBER_CATEGORY_NAMES = ["Tánckar", "Munkatársak", "Zenekar", "Alkotók"];

function isDancerRole(role: string) {
  return role.trim().toLocaleLowerCase("hu-HU") === "táncos";
}

export default async function TarsulatPage() {
  const [profile, members] = await Promise.all([
    prisma.companyProfile.findUnique({
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
    }),
    prisma.member.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        bio: true,
        id: true,
        imageUrl: true,
        name: true,
        role: true,
      },
    }),
  ]);
  const safeMembers = members.map((member) => ({
    ...member,
    bio: member.bio ? sanitizeRichText(member.bio) : null,
  }));
  const visibleMembers = safeMembers.filter((member) => !MEMBER_CATEGORY_NAMES.includes(member.name));
  const dancers = visibleMembers.filter((member) => isDancerRole(member.role));
  const staffMembers = visibleMembers.filter((member) => !isDancerRole(member.role));

  return (
    <main className={contentPage}>
      <p className={eyebrow}>Rólunk</p>
      <h1 className={`${h1} mb-48`}>Hargita Székely Néptáncszínház</h1>
      {profile?.groupImageUrl ? (
        <div className="mt-10 flex justify-center">
          <Image
            alt="Hargita Székely Néptáncszínház csoportkép"
            className="w-full max-w-[902px] border-2 border-line-strong object-cover shadow-[12px_12px_0_rgb(33_31_27_/_14%)]"
            height={572}
            src={profile.groupImageUrl}
            width={902}
          />
        </div>
      ) : null}
      {profile?.introText ? (
        <HomeRevealGroup className="home-reveal-group mt-24">
          <section className="relative left-1/2 w-[90vw] -translate-x-1/2">
            <div
              className={`grid items-start gap-10 ${
                profile.directorImageUrl ? "min-[980px]:grid-cols-[minmax(0,1fr)_minmax(240px,340px)]" : ""
              }`}
            >
              <div
                className="about-intro-reveal rich-text-editor text-[clamp(18px,2vw,22px)] font-bold leading-relaxed text-charcoal"
                dangerouslySetInnerHTML={{ __html: sanitizeRichText(profile.introText) }}
              />
              {profile.directorImageUrl ? (
                <DirectorProfileCard
                  bio={sanitizeRichText(profile.directorBio ?? "")}
                  imageUrl={profile.directorImageUrl}
                  name={profile.directorName ?? ""}
                />
              ) : null}
            </div>
          </section>
        </HomeRevealGroup>
      ) : null}
      {dancers.length > 0 || staffMembers.length > 0 ? (
        <MemberSearchList dancers={dancers} staffMembers={staffMembers} />
      ) : null}
    </main>
  );
}
