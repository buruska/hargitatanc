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
npm run db:push
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

Induláskor SQLite + Prisma van beállítva fejlesztői adatbázisként. Később PostgreSQL-re érdemes váltani, ha az oldal éles tartalomkezelőként és foglalási rendszerként működik majd.
