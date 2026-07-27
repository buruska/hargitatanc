"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { panel } from "@/lib/styles";
import { normalizeSearchValue } from "@/lib/normalize-search";
import { MemberRowActions } from "./member-row-actions";

type MemberListItem = {
  bio: string | null;
  bioEn: string | null;
  bioRo: string | null;
  id: string;
  imageUrl: string | null;
  name: string;
  role: string;
  roleEn: string | null;
  roleRo: string | null;
};

export function MemberAdminSearchList({ members }: { members: MemberListItem[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearchValue(query.trim());
  const filteredMembers = useMemo(() => {
    if (!normalizedQuery) return members;

    return members.filter((member) =>
      normalizeSearchValue([member.name, member.role, member.roleRo, member.roleEn].filter(Boolean).join(" ")).includes(
        normalizedQuery,
      ),
    );
  }, [members, normalizedQuery]);
  const allDancers = members.filter((member) => member.role.trim().toLocaleLowerCase("hu-HU") === "táncos");
  const allStaff = members.filter((member) => member.role.trim().toLocaleLowerCase("hu-HU") !== "táncos");
  const dancers = filteredMembers.filter((member) => member.role.trim().toLocaleLowerCase("hu-HU") === "táncos");
  const staff = filteredMembers.filter((member) => member.role.trim().toLocaleLowerCase("hu-HU") !== "táncos");

  return (
    <div className="grid gap-6">
      <label className="ml-auto block w-full max-w-[320px]">
        <span className="sr-only">Keresés a tagok között</span>
        <input
          className="min-h-[48px] w-full border-2 border-line-strong bg-surface-strong px-4 py-3 text-[16px] font-bold text-charcoal shadow-[6px_6px_0_rgb(33_31_27_/_10%)] outline-none transition placeholder:text-muted/70 focus:border-thread-red"
          placeholder="Keresés a tagok között"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {filteredMembers.length > 0 ? (
        <>
          <MemberListSection allMembers={allDancers} emptyText="Még nincsenek táncosok rögzítve." members={dancers} title="Tánckar" />
          <MemberListSection allMembers={allStaff} emptyText="Még nincsenek munkatársak rögzítve." members={staff} title="Munkatársak" />
        </>
      ) : (
        <div className={`${panel} p-5`}>
          <p className="font-extrabold text-muted">Nincs a keresésnek megfelelő tag.</p>
        </div>
      )}
    </div>
  );
}

function MemberListSection({
  allMembers,
  emptyText,
  members,
  title,
}: {
  allMembers: MemberListItem[];
  emptyText: string;
  members: MemberListItem[];
  title: string;
}) {
  return (
    <section className={`${panel} p-5`}>
      <h3 className="mb-4 font-serif text-2xl font-bold leading-tight text-charcoal">{title}</h3>
      {members.length > 0 ? (
        <div className="grid gap-4">
          {members.map((member) => {
            const originalIndex = allMembers.findIndex((item) => item.id === member.id);
            return (
              <article className="grid gap-4 border-t border-line pt-4 first:border-t-0 first:pt-0 min-[780px]:grid-cols-[86px_minmax(0,1fr)_auto]" key={member.id}>
                {member.imageUrl ? (
                  <Image alt={`${member.name} portré`} className="aspect-square w-full max-w-[86px] border-2 border-line-strong object-cover" height={86} src={member.imageUrl} width={86} />
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
                  <MemberRowActions canMoveDown={originalIndex < allMembers.length - 1} canMoveUp={originalIndex > 0} member={member} />
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-sm font-extrabold text-muted">{emptyText}</p>
      )}
    </section>
  );
}
