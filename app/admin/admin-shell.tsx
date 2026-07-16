import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { getAdminSession } from "@/lib/auth";
import { buttonSecondary, eyebrow, panel } from "@/lib/styles";
import { InactivityLogoutTimer } from "./inactivity-logout";
import { ImageCompressionManager } from "./image-compression-manager";

const adminNavigation = [
  { href: "/admin/statisztikak", label: "Statisztikák" },
  { href: "/admin/alapbeallitasok", label: "Alapbeállítások" },
  { href: "/admin/jatszott-darabok", label: "Játszott darabok" },
  { href: "/admin/galeriak", label: "Galériák" },
  { href: "/admin/rendezvenyek", label: "Rendezvények" },
  { href: "/admin/hirek-es-beszamolok", label: "Hírek és beszámolók" },
  { href: "/admin/tarsulat", label: "Rólunk" },
];

export async function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin");
  }

  return (
    <main className="px-[clamp(18px,4vw,56px)] pb-[150px] pt-[124px]">
      <ImageCompressionManager />
      <section className="mx-auto max-w-[1040px]">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 min-[861px]:flex-row min-[861px]:items-center">
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

        <div className="grid gap-6 min-[861px]:grid-cols-[220px_1fr]">
          <aside className={`${panel} p-4`}>
            <nav aria-label="Admin menü" className="grid gap-2">
              {adminNavigation.map((item) => (
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
          <section>{children}</section>
        </div>
      </section>
    </main>
  );
}
