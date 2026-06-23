import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { LoginForm } from "./login-form";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">Admin</p>
          <h1>Belépés</h1>
          <p>A tartalomszerkesztő felület alapja. A super-admin felhasználó seedből jön létre.</p>
          <LoginForm />
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="admin-shell">
        <div className="admin-toolbar">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Vezérlőpult</h1>
            <p className="lead">Belépve: {session.email}</p>
          </div>
          <form action={logoutAction}>
            <button className="secondary" type="submit">
              Kilépés
            </button>
          </form>
        </div>
        <div className="grid">
          {["Események", "Hírek", "Társulat", "Galéria", "Oldalszövegek", "Foglalások"].map((item) => (
            <article className="card" key={item}>
              <h2>{item}</h2>
              <p>A következő fejlesztési körben ide kerül a szerkesztő felület.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
