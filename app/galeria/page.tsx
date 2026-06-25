import { card, contentPage, eyebrow, gridThree, h1, h2, leadSpaced, placeholderPhoto } from "@/lib/styles";

export default function GaleriaPage() {
  return (
    <main className={contentPage}>
      <p className={eyebrow}>Galéria</p>
      <h1 className={h1}>Előadásképek és albumok</h1>
      <p className={leadSpaced}>A galéria később albumokból és képekből épül fel, adminból szerkeszthető sorrenddel.</p>
      <section className={gridThree}>
        {["Táncelőadások", "Próbák", "Turnék", "Rendezvények", "Portrék", "Archívum"].map((album) => (
          <article className={card} key={album}>
            <div className={placeholderPhoto} />
            <h2 className={h2}>{album}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}
