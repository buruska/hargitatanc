import { AdminShell } from "../admin-shell";
import { prisma } from "@/lib/prisma";
import { adminTitle, eyebrow, panel } from "@/lib/styles";

const roleNames = {
  SUPER_ADMIN: "Főadminisztrátor",
  EDITOR: "Szerkesztő",
} as const;

export default async function AdminokPage() {
  const admins = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      createdAt: true,
      email: true,
      id: true,
      role: true,
    },
  });
  const dateFormatter = new Intl.DateTimeFormat("hu-RO", { dateStyle: "medium" });

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-4 min-[620px]:flex-row min-[620px]:items-end min-[620px]:justify-between">
        <div>
          <p className={eyebrow}>Felhasználókezelés</p>
          <h1 className={`${adminTitle} mb-0`}>Adminok</h1>
        </div>
        <button
          aria-describedby="admin-add-status"
          className="inline-flex min-h-[46px] cursor-not-allowed items-center justify-center border-2 border-charcoal bg-thread-red px-[18px] py-3 font-extrabold text-surface-strong opacity-50"
          disabled
          type="button"
        >
          Admin hozzáadása
        </button>
      </div>
      <p className="sr-only" id="admin-add-status">Az admin hozzáadása funkció hamarosan elérhető.</p>

      <section className={panel}>
        <div className="border-b-2 border-charcoal px-5 py-4">
          <h2 className="font-serif text-2xl font-bold">Jelenlegi adminok</h2>
          <p className="mt-1 text-sm font-bold text-muted">{admins.length} felhasználó</p>
        </div>
        {admins.length === 0 ? (
          <p className="p-5 font-bold text-muted">Nincs adminisztrátor létrehozva.</p>
        ) : (
          <ul className="divide-y divide-line">
            {admins.map((admin) => (
              <li className="flex flex-col gap-2 px-5 py-4 min-[620px]:flex-row min-[620px]:items-center min-[620px]:justify-between" key={admin.id}>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-charcoal">{admin.email}</p>
                  <p className="mt-1 text-xs font-bold text-muted">Létrehozva: {dateFormatter.format(admin.createdAt)}</p>
                </div>
                <span className="w-fit border border-petrol/40 bg-petrol/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.06em] text-petrol">
                  {roleNames[admin.role]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}
