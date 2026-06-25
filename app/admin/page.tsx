import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { buttonSecondary, card, eyebrow, gridThree, h1, h2, lead, page, panel } from "@/lib/styles";
import { prisma } from "@/lib/prisma";
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

  const [events, posts, members, albums, users] = await Promise.all([
    prisma.event.count(),
    prisma.newsPost.count(),
    prisma.member.count(),
    prisma.galleryAlbum.count(),
    prisma.user.count(),
  ]);

  const dashboardCards = [
    { label: "Események", count: events, description: "Adatbázisból betöltött előadások és rendezvények." },
    { label: "Hírek", count: posts, description: "Publikált vagy előkészített hírbejegyzések." },
    { label: "Társulat", count: members, description: "Társulati tagok és bemutatkozó csoportkártyák." },
    { label: "Galéria", count: albums, description: "Galéria albumok, később képekkel bővítve." },
    { label: "Felhasználók", count: users, description: "Admin és szerkesztői hozzáférések." },
    { label: "Foglalások", count: 0, description: "A foglalási adatmodell a következő körben kerülhet be." },
  ];

  return (
    <main className={page}>
      <section className="mx-auto max-w-[1040px]">
        <div className="mb-6 flex flex-col items-start justify-between min-[861px]:flex-row min-[861px]:items-center">
          <div>
            <p className={eyebrow}>Admin</p>
            <h1 className={h1}>Vezérlőpult</h1>
            <p className={lead}>Belépve: {session.email}</p>
          </div>
          <form action={logoutAction}>
            <button className={buttonSecondary} type="submit">
              Kilépés
            </button>
          </form>
        </div>
        <div className={gridThree}>
          {dashboardCards.map((item) => (
            <article className={card} key={item.label}>
              <p className="mb-2 text-[13px] font-extrabold uppercase text-petrol">{item.count} rekord</p>
              <h2 className={h2}>{item.label}</h2>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
