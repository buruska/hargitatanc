import { card, contentPage, eyebrow, gridTwo, h1, h2, leadSpaced } from "@/lib/styles";

export default function KapcsolatPage() {
  return (
    <main className={contentPage}>
      <p className={eyebrow}>Kapcsolat</p>
      <h1 className={h1}>Elérhetőségek</h1>
      <p className={leadSpaced}>Csíkszereda, Hargita megye - 530102, Temesvári sugárút 6. szám</p>
      <section className={gridTwo}>
        <article className={card}>
          <h2 className={h2}>Kapcsolat</h2>
          <p>Tel.: 0040 724 309 524</p>
          <p>E-mail: hargitaneptanc@gmail.com</p>
        </article>
        <article className={card}>
          <h2 className={h2}>Térkép</h2>
          <p>Beágyazott térkép helye. Élesítés előtt Google Maps vagy OpenStreetMap alapú megoldást érdemes bekötni.</p>
        </article>
      </section>
    </main>
  );
}
