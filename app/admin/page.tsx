import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { eyebrow, h1, panel } from "@/lib/styles";
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

  redirect("/admin/statisztikak");
}
