import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { requireAdmin } from "@/lib/auth";
import { buttonSecondary, eyebrow, panel } from "@/lib/styles";
import { InactivityLogoutTimer } from "./inactivity-logout";
import { ImageCompressionManager } from "./image-compression-manager";

const adminNavigation = [
  { href: "/admin/statisztikak", label: "Statisztikák" },
  { href: "/admin/alapbeallitasok", label: "Alapbeállítások" },
  { href: "/admin/jatszott-darabok", label: "Játszott darabok" },
  { href: "/admin/tarsulat", label: "Rólunk" },
  { href: "/admin/hirek-es-beszamolok", label: "Hírek és beszámolók" },
  { href: "/admin/galeriak", label: "Galériák" },
  { href: "/admin/rendezvenyek", label: "Események" },
  { href: "/admin/dokumentumok", label: "Dokumentumok" },
  { href: "/admin/kozossegi-media", label: "Közösségi média" },
  { href: "/admin/adminok", label: "Adminok" },
  { href: "/admin/tevekenysegnaplo", label: "Tevékenységnapló" },
  { href: "/admin/oldalelemek", label: "Oldalelemek változtatása" },
];

export async function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdmin();
  const visibleNavigation = session.role === "ADMIN"
    ? adminNavigation.filter((item) => !["/admin/adminok", "/admin/tevekenysegnaplo", "/admin/oldalelemek"].includes(item.href))
    : adminNavigation;

  return (
    <main className="admin-shell px-[clamp(18px,4vw,56px)] pb-[150px] pt-[124px]">
      <ImageCompressionManager />
      <section className="mx-auto max-w-[1040px]">
        <div className="grid gap-6 min-[861px]:grid-cols-[220px_minmax(0,1fr)]">
          <aside className={`${panel} h-fit self-start p-4 min-[861px]:sticky min-[861px]:top-[112px]`}>
            <nav aria-label="Admin menü" className="grid gap-2">
              {visibleNavigation.map((item) => (
                <Link
                  className="border border-line bg-surface-strong px-3 py-2 text-sm font-extrabold text-muted hover:border-charcoal hover:bg-thread-red hover:text-surface-strong"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <section className="min-w-0">
            <div className="mb-6 flex flex-col items-end gap-3 text-right min-[620px]:flex-row min-[620px]:justify-end">
              <div>
                <p className={eyebrow}>Admin</p>
                <p className="text-[clamp(17px,2vw,21px)] text-muted">Belépve: {session.email}</p>
                <InactivityLogoutTimer />
              </div>
              <form action={logoutAction}>
                <button className={buttonSecondary} type="submit">
                  Kilépés
                </button>
              </form>
            </div>
            {children}
          </section>
        </div>
      </section>
    </main>
  );
}
