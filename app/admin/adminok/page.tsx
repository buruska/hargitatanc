import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminTitle, eyebrow, panel } from "@/lib/styles";
import { AdminShell } from "../admin-shell";
import { AddAdminForm } from "./add-admin-form";
import { DeleteAdminButton } from "./delete-admin-button";

const roleNames = {
  SUPER_ADMIN: "Szuperadmin",
  MAIN_ADMIN: "Főadmin",
  ADMIN: "Admin",
} as const;

export default async function AdminokPage() {
  const currentAdmin = await requireAdmin();
  if (currentAdmin.role === "ADMIN") redirect("/admin/statisztikak");

  const admins = await prisma.user.findMany({
    where: currentAdmin.role === "SUPER_ADMIN" ? undefined : { role: { not: "SUPER_ADMIN" } },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { createdAt: true, email: true, id: true, role: true },
  });
  const dateFormatter = new Intl.DateTimeFormat("hu-RO", { dateStyle: "medium" });

  return (
    <AdminShell>
      <div className="mb-6">
        <p className={eyebrow}>Felhasználókezelés</p>
        <h1 className={`${adminTitle} mb-0`}>Adminok</h1>
      </div>

      <section className={`${panel} mb-6 p-5`}>
        <h2 className="mb-4 font-serif text-2xl font-bold">
          {currentAdmin.role === "SUPER_ADMIN" ? "Adminisztrátor hozzáadása" : "Admin hozzáadása"}
        </h2>
        <AddAdminForm canCreateMainAdmin={currentAdmin.role === "SUPER_ADMIN"} />
      </section>

      <section className={panel}>
        <div className="border-b-2 border-charcoal px-5 py-4">
          <h2 className="font-serif text-2xl font-bold">Jelenlegi adminok</h2>
          <p className="mt-1 text-sm font-bold text-muted">{admins.length} felhasználó</p>
        </div>
        {admins.length === 0 ? (
          <p className="p-5 font-bold text-muted">Nincs megjeleníthető adminisztrátor.</p>
        ) : (
          <ul className="divide-y divide-line">
            {admins.map((admin) => (
              <li className="flex flex-col gap-2 px-5 py-4 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between" key={admin.id}>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-charcoal">{admin.email}</p>
                  <p className="mt-1 text-xs font-bold text-muted">Létrehozva: {dateFormatter.format(admin.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="w-fit border border-petrol/40 bg-petrol/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] text-petrol">
                    {roleNames[admin.role]}
                  </span>
                  {currentAdmin.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN" ? (
                    <DeleteAdminButton email={admin.email} userId={admin.id} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
