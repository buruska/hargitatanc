export default function TarsulatPage() {
  return (
    <main className="page content-page">
      <p className="eyebrow">Társulat</p>
      <h1>A közösségért, amely táplál</h1>
      <p className="lead">
        Bemutatkozó oldal a Hargita Székely Néptáncszínház tagjainak, szellemiségének és múltjának.
      </p>
      <section className="grid two">
        {["Tánckar", "Zenekar", "Alkotók", "Munkatársak"].map((item) => (
          <article className="card" key={item}>
            <div className="placeholder-photo" />
            <h2>{item}</h2>
            <p>A későbbi admin felületen kezelhető tagkártyák helye.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
