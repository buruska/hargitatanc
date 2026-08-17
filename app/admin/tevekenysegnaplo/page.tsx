import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminTitle, eyebrow } from "@/lib/styles";
import { AdminShell } from "../admin-shell";
import { ActivityLogList } from "./activity-log-list";

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
      <ActivityLogList entries={entries.map((entry) => ({
        action: entry.action,
        actionName: actionNames[entry.action] ?? entry.action,
        actorEmail: entry.actorEmail,
        actorRole: entry.actorRole,
        actorRoleName: roleNames[entry.actorRole] ?? entry.actorRole,
        createdAt: entry.createdAt.toISOString(),
        createdAtLabel: dateFormatter.format(entry.createdAt),
        entityLabel: entry.entityLabel,
        entityName: entityNames[entry.entityType] ?? entry.entityType,
        entityType: entry.entityType,
        id: entry.id,
      }))} />
    </AdminShell>
  );
}
