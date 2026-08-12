# Hargita Székely Néptáncszínház

Modern Next.js alapú weboldalváz a hargitatanc.ro új verziójához.

## Oldalak

- `/` - Főoldal CTA-val, kiemelt eseményekkel és hírekkel
- `/tarsulat` - Társulat bemutatása
- `/hirek` - Hírek listája
- `/esemenyeink` - Előadások és rendezvények
- `/galeria` - Galéria albumok vázoldala
- `/kapcsolat` - Kapcsolati adatok
- `/admin` - Admin belépés és vezérlőpult váz

## Indítás fejlesztéshez

```bash
npm install
cp .env.example .env
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Windows PowerShellben a `.env` másolása:

```powershell
Copy-Item .env.example .env
```

## Admin

A seed létrehoz egy super-admin felhasználót:

- Felhasználónév: `burusakos@yahoo.co.uk`
- Jelszó: a projekt indításához megadott ideiglenes jelszó

Élesítés előtt az ideiglenes jelszót és az `AUTH_SECRET` értékét mindenképpen cserélni kell.

## Adatbázis

### Meglévő adatbázis első migrációs telepítése

A projekt korábban migrációs előzmények nélkül, `prisma db push` paranccsal működött.
Egy már létező adatbázison először készíts biztonsági mentést, majd egyszer futtasd:

```bash
npx prisma migrate resolve --applied 20260812090000_baseline
npm run db:migrate:deploy
```

Ez a meglévő táblákat változatlanul hagyja, majd hozzáadja a közösségimédia-linkek
mezőit. Új, üres adatbázison csak az alábbi parancs szükséges:

```bash
npm run db:migrate:deploy
```

Induláskor SQLite + Prisma van beállítva fejlesztői adatbázisként. Később PostgreSQL-re érdemes váltani, ha az oldal éles tartalomkezelőként és foglalási rendszerként működik majd.
