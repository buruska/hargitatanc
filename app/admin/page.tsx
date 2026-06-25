import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { buttonSecondary, eyebrow, h1, page, panel } from "@/lib/styles";
import { LoginForm } from "./login-form";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return (
      <main className="grid min-h-[calc(100vh-157px)] place-items-center px-[18px] py-[42px]">
        <section className={`${panel} w-full max-w-[460px] p-[26px]`}>
          <p className={eyebrow}>Admin</p>
          <h1 className={h1}>Belépés</h1>
          <p>A tartalomszerkesztő felület alapja. A super-admin felhasználó seedből jön létre.</p>
          <LoginForm />
        </section>
      </main>
    );
  }

  return (
    <main className={page}>
      <section className="mx-auto max-w-[1040px]">
        <div className="flex flex-col items-start justify-between gap-4 min-[861px]:flex-row min-[861px]:items-center">
          <div>
            <p className={eyebrow}>Admin</p>
            <p className="text-[clamp(17px,2vw,21px)] text-muted">Belépve: {session.email}</p>
          </div>
          <form action={logoutAction}>
            <button className={buttonSecondary} type="submit">
              Kilépés
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
