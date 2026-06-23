export default function GaleriaPage() {
  return (
    <main className="page content-page">
      <p className="eyebrow">Galéria</p>
      <h1>Előadásképek és albumok</h1>
      <p className="lead">A galéria később albumokból és képekből épül fel, adminból szerkeszthető sorrenddel.</p>
      <section className="grid">
        {["Táncelőadások", "Próbák", "Turnék", "Rendezvények", "Portrék", "Archívum"].map((album) => (
          <article className="card" key={album}>
            <div className="placeholder-photo" />
            <h2>{album}</h2>
          </article>
        ))}
      </section>
    </main>
  );
}
