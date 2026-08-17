import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { eyebrow, panel } from "@/lib/styles";
import { PasswordChangeForm } from "./password-change-form";

export default async function RequiredPasswordChangePage() {
  const admin = await requireAdmin({ allowRequiredPasswordChange: true });
  if (!admin.mustChangePassword) redirect("/admin/statisztikak");

  return (
    <main className="grid min-h-screen place-items-center px-[18px] py-[120px]">
      <section className={`${panel} w-full max-w-[520px] p-6`}>
        <p className={eyebrow}>Első belépés</p>
        <h1 className="mb-3 font-serif text-[clamp(26px,4vw,38px)] font-bold leading-[1.05]">Jelszó megváltoztatása</h1>
        <p className="mb-6 font-bold leading-relaxed text-muted">
          A folytatáshoz cseréld le az ideiglenes jelszavadat egy saját jelszóra.
        </p>
        <PasswordChangeForm />
      </section>
    </main>
  );
}
