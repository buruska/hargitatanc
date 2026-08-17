"use client";

import { useMemo, useState } from "react";
import { input, panel } from "@/lib/styles";
import { normalizeSearchValue } from "@/lib/normalize-search";

export type ActivityLogItem = {
  action: string;
  actionName: string;
  actorEmail: string;
  actorRole: string;
  actorRoleName: string;
  createdAt: string;
  createdAtLabel: string;
  entityLabel: string | null;
  entityName: string;
  entityType: string;
  id: string;
};

export function ActivityLogList({ entries }: { entries: ActivityLogItem[] }) {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const admins = useMemo(() => Array.from(new Map(
    entries.map((entry) => [entry.actorEmail, { email: entry.actorEmail, role: entry.actorRoleName }]),
  ).values()).sort((a, b) => a.email.localeCompare(b.email, "hu")), [entries]);
  const filteredEntries = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(searchQuery.trim());
    return entries.filter((entry) => {
      if (selectedAdmin && entry.actorEmail !== selectedAdmin) return false;
      if (!normalizedQuery) return true;
      return normalizeSearchValue([
        entry.actionName,
        entry.actorEmail,
        entry.actorRoleName,
        entry.createdAtLabel,
        entry.entityLabel,
        entry.entityName,
      ].filter(Boolean).join(" ")).includes(normalizedQuery);
    });
  }, [entries, searchQuery, selectedAdmin]);

  return (
    <>
      <section className={`${panel} mb-6 grid gap-4 p-4 min-[700px]:grid-cols-[minmax(220px,0.8fr)_minmax(280px,1.2fr)]`}>
        <label className="grid gap-1.5 text-sm font-extrabold text-muted">
          Admin szűrése
          <select className={input} value={selectedAdmin} onChange={(event) => setSelectedAdmin(event.target.value)}>
            <option value="">Minden admin</option>
            {admins.map((admin) => <option key={admin.email} value={admin.email}>{admin.email} – {admin.role}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-extrabold text-muted">
          Keresés a tevékenységek között
          <input autoComplete="off" className={input} placeholder="Keresés név, művelet vagy tartalom alapján…" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
        </label>
        <p className="text-sm font-bold text-muted min-[700px]:col-span-2" role="status">
          {filteredEntries.length} találat
        </p>
      </section>

      <section className={panel}>
        {filteredEntries.length === 0 ? (
          <p className="p-5 font-bold text-muted">Nincs a szűrésnek megfelelő tevékenység.</p>
        ) : (
          <ol className="divide-y divide-line">
            {filteredEntries.map((entry) => (
              <li className="grid gap-2 px-5 py-4 min-[700px]:grid-cols-[minmax(0,1fr)_auto] min-[700px]:items-center" key={entry.id}>
                <div className="min-w-0">
                  <p className="font-extrabold text-charcoal">
                    {entry.actionName} – {entry.entityName}
                    {entry.entityLabel ? <span className="text-muted">: {entry.entityLabel}</span> : null}
                  </p>
                  <p className="mt-1 text-sm font-bold text-muted">{entry.actorEmail} · {entry.actorRoleName}</p>
                </div>
                <time className="text-xs font-bold text-muted" dateTime={entry.createdAt}>{entry.createdAtLabel}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
