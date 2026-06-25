import { card, contentPage, eyebrow, gridThree, h1, h2, leadSpaced, placeholderPhoto } from "@/lib/styles";
import { prisma } from "@/lib/prisma";

export default async function GaleriaPage() {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className={contentPage}>
      <p className={eyebrow}>Galéria</p>
      <h1 className={h1}>Előadásképek és albumok</h1>
      <p className={leadSpaced}>A galéria később albumokból és képekből épül fel, adminból szerkeszthető sorrenddel.</p>
      <section className={gridThree}>
        {albums.map((album) => (
          <article className={card} key={album.id}>
            <div className={placeholderPhoto} />
            <h2 className={h2}>{album.title}</h2>
            {album.description ? <p>{album.description}</p> : null}
          </article>
        ))}
        {albums.length === 0 ? (
          <article className={card}>
            <h2 className={h2}>Még nincs galéria album</h2>
            <p>Futtasd a seedet, vagy hozz létre albumokat az admin felületen, amint elkészül a szerkesztés.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
