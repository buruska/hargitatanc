"use client";

import { useMemo, useState } from "react";
import { MemberProfileCard } from "./member-profile-card";

type MemberCard = {
  bio: string | null;
  id: string;
  imageUrl: string | null;
  name: string;
  role: string;
};

type MemberSearchListProps = {
  dancers: MemberCard[];
  staffMembers: MemberCard[];
};

export function MemberSearchList({ dancers, staffMembers }: MemberSearchListProps) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim().toLocaleLowerCase("hu-HU");

  const filteredDancers = useMemo(() => {
    if (!trimmedQuery) {
      return dancers;
    }

    return dancers.filter((member) => {
      const searchableText = `${member.name} ${member.role}`.toLocaleLowerCase("hu-HU");

      return searchableText.includes(trimmedQuery);
    });
  }, [dancers, trimmedQuery]);

  const filteredStaffMembers = useMemo(() => {
    if (!trimmedQuery) {
      return staffMembers;
    }

    return staffMembers.filter((member) => {
      const searchableText = `${member.name} ${member.role}`.toLocaleLowerCase("hu-HU");

      return searchableText.includes(trimmedQuery);
    });
  }, [staffMembers, trimmedQuery]);

  const filteredMembers = useMemo(() => {
    if (!trimmedQuery) {
      return [];
    }

    return [
      ...filteredDancers.map((member) => ({ ...member, variant: "red" as const })),
      ...filteredStaffMembers.map((member) => ({ ...member, variant: "green" as const })),
    ];
  }, [filteredDancers, filteredStaffMembers, trimmedQuery]);

  const hasResults = filteredDancers.length > 0 || filteredStaffMembers.length > 0;

  return (
    <section className="relative left-1/2 mt-32 w-[70vw] -translate-x-1/2">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <h2 className="font-serif text-[clamp(17px,2.5vw,32px)] font-bold leading-[1.02] text-charcoal">Tagjaink</h2>
        <label className="mt-16 block w-full max-w-[280px]">
          <span className="sr-only">Tagok keresése</span>
          <input
            className="min-h-[48px] w-full border-2 border-line-strong bg-surface-strong px-4 py-3 text-[16px] font-bold text-charcoal shadow-[6px_6px_0_rgb(33_31_27_/_10%)] outline-none transition placeholder:text-muted/70 focus:border-thread-red focus:shadow-[8px_8px_0_rgb(179_38_32_/_16%)]"
            placeholder="Keresés a tagok között"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {hasResults ? (
        <>
          {trimmedQuery ? (
            <div className="grid grid-cols-1 gap-x-7 gap-y-14 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1180px]:grid-cols-4">
              {filteredMembers.map((member) => (
                <MemberProfileCard
                  bio={member.bio ?? ""}
                  imageUrl={member.imageUrl}
                  key={member.id}
                  name={member.name}
                  role={member.role}
                  variant={member.variant}
                />
              ))}
            </div>
          ) : (
            <>
              {filteredDancers.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-7 gap-y-14 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1180px]:grid-cols-4">
                  {filteredDancers.map((member) => (
                    <MemberProfileCard
                      bio={member.bio ?? ""}
                      imageUrl={member.imageUrl}
                      key={member.id}
                      name={member.name}
                      role={member.role}
                    />
                  ))}
                </div>
              ) : null}

              {filteredStaffMembers.length > 0 ? (
                <div className="mt-24 grid grid-cols-1 gap-x-7 gap-y-14 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1180px]:grid-cols-4">
                  {filteredStaffMembers.map((member) => (
                    <MemberProfileCard
                      bio={member.bio ?? ""}
                      imageUrl={member.imageUrl}
                      key={member.id}
                      name={member.name}
                      role={member.role}
                      variant="green"
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </>
      ) : (
        <p className="border-2 border-line bg-surface-strong px-5 py-4 text-[15px] font-extrabold text-muted">
          Nincs találat erre a keresésre.
        </p>
      )}
    </section>
  );
}
