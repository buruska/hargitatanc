import { card, contentPage, eyebrow, gridTwo, h1, h2, leadSpaced, placeholderPhoto } from "@/lib/styles";

export default function TarsulatPage() {
  return (
    <main className={contentPage}>
      <p className={eyebrow}>Társulat</p>
      <h1 className={h1}>A közösségért, amely táplál</h1>
      <p className={leadSpaced}>
        Bemutatkozó oldal a Hargita Székely Néptáncszínház tagjainak, szellemiségének és múltjának.
      </p>
      <section className={gridTwo}>
        {["Tánckar", "Zenekar", "Alkotók", "Munkatársak"].map((item) => (
          <article className={card} key={item}>
            <div className={placeholderPhoto} />
            <h2 className={h2}>{item}</h2>
            <p>A későbbi admin felületen kezelhető tagkártyák helye.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
