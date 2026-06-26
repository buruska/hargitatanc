import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eyebrow, panel } from "@/lib/styles";
import { HeroCoverCarousel } from "../hero-cover-carousel";
import { LoginForm } from "./login-form";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    const performances = await prisma.runningPerformance.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        coverImageUrl: true,
      },
    });

    return (
      <main className="relative isolate grid min-h-screen place-items-center overflow-hidden px-[18px] py-[120px]">
        <HeroCoverCarousel covers={performances} className="absolute inset-0 -z-20 h-full w-full overflow-hidden" />
        <div className="absolute inset-0 -z-10 bg-charcoal/55" />
        <section className={`${panel} w-full max-w-[460px] p-[26px]`}>
          <p className={eyebrow}>Admin</p>
          <h1 className="mb-[18px] font-serif text-[clamp(21px,3.5vw,41px)] font-bold leading-[0.98]">Belépés</h1>
          <LoginForm />
        </section>
      </main>
    );
  }

  redirect("/admin/statisztikak");
}
