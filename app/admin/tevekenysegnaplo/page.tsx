import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminTitle, eyebrow, panel } from "@/lib/styles";
import { AdminShell } from "../admin-shell";

const actionNames: Record<string, string> = { CREATE: "Hozzáadta", UPDATE: "Módosította", DELETE: "Törölte" };
const entityNames: Record<string, string> = {
  CompanyProfile: "társulati alapadat",
  DefaultCoverImage: "alap borítókép",
  Document: "dokumentum",
  Event: "esemény",
  GalleryAlbum: "galéria",
  Member: "társulati tag",
  NewsPost: "hír vagy beszámoló",
  RunningPerformance: "előadás vagy galéria",
  RunningPerformanceEvent: "fellépés",
  RunningPerformanceGalleryImage: "galériakép",
  RichTextFile: "szövegszerkesztőhöz feltöltött fájl",
  User: "adminisztrátor",
};
const roleNames: Record<string, string> = { SUPER_ADMIN: "Szuperadmin", MAIN_ADMIN: "Főadmin", ADMIN: "Admin" };

export default async function ActivityLogPage() {
  const currentAdmin = await requireAdmin();
  if (currentAdmin.role === "ADMIN") redirect("/admin/statisztikak");

  const entries = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  const dateFormatter = new Intl.DateTimeFormat("hu-RO", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Bucharest",
  });

  return (
    <AdminShell>
      <div className="mb-6">
        <p className={eyebrow}>Ellenőrzés</p>
        <h1 className={`${adminTitle} mb-0`}>Tevékenységnapló</h1>
        <p className="mt-2 font-bold text-muted">A legutóbbi 300 adminisztrációs módosítás.</p>
      </div>
      <section className={panel}>
        {entries.length === 0 ? <p className="p-5 font-bold text-muted">Még nincs naplózott tevékenység.</p> : (
          <ol className="divide-y divide-line">
            {entries.map((entry) => (
              <li className="grid gap-2 px-5 py-4 min-[700px]:grid-cols-[minmax(0,1fr)_auto] min-[700px]:items-center" key={entry.id}>
                <div className="min-w-0">
                  <p className="font-extrabold text-charcoal">
                    {actionNames[entry.action] ?? entry.action} – {entityNames[entry.entityType] ?? entry.entityType}
                    {entry.entityLabel ? <span className="text-muted">: {entry.entityLabel}</span> : null}
                  </p>
                  <p className="mt-1 text-sm font-bold text-muted">{entry.actorEmail} · {roleNames[entry.actorRole] ?? entry.actorRole}</p>
                </div>
                <time className="text-xs font-bold text-muted" dateTime={entry.createdAt.toISOString()}>{dateFormatter.format(entry.createdAt)}</time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AdminShell>
  );
}
