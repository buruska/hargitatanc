import { card, contentPage, eyebrow, gridTwo, h1, h2, leadSpaced, placeholderPhoto } from "@/lib/styles";
import { prisma } from "@/lib/prisma";

export default async function TarsulatPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <main className={contentPage}>
      <p className={eyebrow}>Társulat</p>
      <h1 className={h1}>A közösségért, amely táplál</h1>
      <p className={leadSpaced}>
        Bemutatkozó oldal a Hargita Székely Néptáncszínház tagjainak, szellemiségének és múltjának.
      </p>
      <section className={gridTwo}>
        {members.map((member) => (
          <article className={card} key={member.id}>
            <div
              className={placeholderPhoto}
              style={member.imageUrl ? { backgroundImage: `url(${member.imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
            />
            <h2 className={h2}>{member.name}</h2>
            <p className="mb-2.5 font-extrabold text-petrol">{member.role}</p>
            {member.bio ? <p>{member.bio}</p> : null}
          </article>
        ))}
        {members.length === 0 ? (
          <article className={card}>
            <h2 className={h2}>Még nincs társulati adat</h2>
            <p>Futtasd a seedet, vagy hozz létre tagokat az admin felületen, amint elkészül a szerkesztés.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
