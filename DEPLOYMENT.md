# Éles telepítés Ubuntu VPS-re Docker Compose használatával

Az alkalmazás Next.js standalone buildként fut Dockerben. Az SQLite-adatbázist és az
adminfelületen feltöltött fájlokat névvel ellátott Docker-volume-ok őrzik, ezért egy
konténer újraépítése vagy cseréje nem törli az adatokat.

## 1. Szükséges hozzáférések

- Ubuntu VPS SSH- és `sudo`-hozzáféréssel
- a `hargitatanc.ro` DNS-kezelője
- hozzáférés a GitHub repositoryhoz
- nyitott 22-es, 80-as és 443-as port

A telepítéshez ajánlott legalább 2 GB memória. Kisebb szerveren ideiglenes swapra lehet
szükség a Docker image felépítése közben.

## 2. A szerver előkészítése

Jelentkezz be SSH-val, majd frissítsd a rendszert:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git nginx certbot python3-certbot-nginx
```

Telepítsd a Docker Engine-t a hivatalos Docker repositoryból. Ubuntu alatt a telepítés
után ezeknek a parancsoknak kell működniük:

```bash
docker --version
docker compose version
sudo systemctl enable --now docker
```

Ha nem `root` felhasználóval dolgozol, add hozzá a felhasználót a Docker-csoporthoz,
majd jelentkezz ki és vissza:

```bash
sudo usermod -aG docker "$USER"
```

Opcionális, de ajánlott tűzfalbeállítás:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 3. A projekt klónozása

```bash
sudo mkdir -p /var/www/hargitatanc
sudo chown -R "$USER":"$USER" /var/www/hargitatanc
git clone https://github.com/buruska/hargitatanc.git /var/www/hargitatanc/app
cd /var/www/hargitatanc/app
```

Privát repository esetén GitHub deploy key vagy személyes hozzáférési token szükséges.
Az SSH deploy key használata ajánlott.

## 4. Éles környezeti változók

Hozd létre a szerveren a nem verziókezelt `.env.docker` fájlt:

```bash
cp .env.docker.example .env.docker
openssl rand -base64 64
nano .env.docker
chmod 600 .env.docker
```

A fájl tartalma:

```env
AUTH_SECRET="AZ_OPENSSL_ALTAL_GENERALT_LEGALABB_64_KARAKTERES_ERTEK"
ADMIN_EMAIL="admin@hargitaneptanc.ro"
ADMIN_PASSWORD="EGYEDI_EROS_LEGALABB_12_KARAKTERES_JELSZO"
```

A `DATABASE_URL` értékét nem kell itt megadni: a `compose.yaml` az adatbázist a tartós
`hargitatanc-database` volume-ban, `/app/data/production.db` néven kezeli.

Az `.env.docker` fájlt soha ne commitold. Az első admin létrehozása után az
`ADMIN_PASSWORD` sor eltávolítható, de az `AUTH_SECRET` értékét meg kell őrizni. Az
`AUTH_SECRET` cseréje minden aktív admin-munkamenetet kijelentkeztet.

## 5. Az első build és adatbázis-előkészítés

Ellenőrizd a Compose-konfigurációt:

```bash
docker compose config --quiet
```

Építsd fel az alkalmazás- és migrációs image-et:

```bash
docker compose build app migrate
```

Hozd létre vagy frissítsd az adatbázis sémáját:

```bash
docker compose --profile tools run --rm migrate
```

Csak új, üres adatbázisnál hozd létre az első admint és az alapadatokat:

```bash
docker compose --profile tools run --rm migrate npm run db:seed
```

A seed meglévő super-admin jelszavát nem írja felül.

## 6. Az alkalmazás elindítása

```bash
docker compose up -d app
docker compose ps
docker compose logs --tail=100 app
```

Az állapotnak rövid időn belül `healthy` értékre kell váltania. Helyi ellenőrzés a
szerveren:

```bash
curl -I http://127.0.0.1:3000
```

A Compose csak a szerver belső `127.0.0.1:3000` címére publikálja az alkalmazást, ezért
a 3000-es portot nem kell és nem szabad közvetlenül megnyitni az internet felé.

## 7. Nginx reverse proxy

Hozd létre az `/etc/nginx/sites-available/hargitatanc.ro` fájlt:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name hargitatanc.ro www.hargitatanc.ro;

    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

Kapcsold be és ellenőrizd a konfigurációt:

```bash
sudo ln -s /etc/nginx/sites-available/hargitatanc.ro /etc/nginx/sites-enabled/hargitatanc.ro
sudo nginx -t
sudo systemctl reload nginx
```

Ha a szimbolikus link már létezik, nem kell újra létrehozni.

## 8. DNS és HTTPS

A tanúsítvány igénylése előtt a következő rekordoknak a VPS nyilvános IP-címére kell
mutatniuk:

- `hargitatanc.ro` — A rekord
- `www.hargitatanc.ro` — A rekord vagy CNAME a fő domainre

Ezután állítsd be a Let's Encrypt tanúsítványt:

```bash
sudo certbot --nginx -d hargitatanc.ro -d www.hargitatanc.ro
sudo certbot renew --dry-run
```

A Certbot állítsa be a HTTP → HTTPS átirányítást.

## 9. Meglévő lokális adatok átvitele

Az átvitelhez két külön mentés szükséges:

- `production.db`: a teljes SQLite-adatbázis
- `uploads` archívum: minden kép, dokumentum és szerkesztőből feltöltött fájl

Az import előtt állítsd le az alkalmazást:

```bash
cd /var/www/hargitatanc/app
docker compose down
```

Az adatokat a `hargitatanc-database` és `hargitatanc-uploads` volume-okba kell
visszaállítani. Az adatbázis másolása után futtasd a migrációkat, majd indítsd újra az
alkalmazást:

```bash
docker compose --profile tools run --rm migrate
docker compose up -d app
docker compose ps
```

Adatbázisfájlt futó alkalmazás alatt ne írj felül. Az exportálás és visszaállítás pontos
parancsait az átviteli csomag elkészítésekor, az archívumnevek ismeretében kell futtatni.

## 10. Frissítés új verzióra

Minden frissítés előtt készíts mentést, majd:

```bash
cd /var/www/hargitatanc/app
git pull --ff-only
docker compose build app migrate
docker compose --profile tools run --rm migrate
docker compose up -d app
docker compose ps
docker compose logs --tail=100 app
```

A `docker compose up -d app` az új image használatával lecseréli a konténert, de a
névvel ellátott adatbázis- és uploads-volume-okat nem törli.

## 11. Biztonsági mentés

Naponta mentsd mindkét volume-ot egy, a projektkönyvtáron kívüli helyre. A mentési
folyamatnak legalább ezeket kell tartalmaznia:

- SQLite-adatbázis konzisztens másolata
- a teljes uploads-volume tömörített archívuma
- legalább 7–14 napi példány megőrzése
- lehetőleg egy szerveren kívüli másolat

A visszaállítást legalább egyszer próbáld ki. A nem ellenőrzött mentés önmagában nem
tekinthető működő biztonsági mentésnek.

## 12. Hasznos parancsok és hibakeresés

```bash
# Állapot
docker compose ps

# Folyamatos alkalmazásnapló
docker compose logs -f app

# Újraindítás image-építés nélkül
docker compose restart app

# Leállítás az adatok megtartásával
docker compose down

# Felhasznált lemezterület
docker system df
```

Ne használd a `docker compose down -v` parancsot, mert az törli a projekthez tartozó
adatbázis- és uploads-volume-okat.

## 13. Éles ellenőrzőlista

- A `docker compose ps` szerint az alkalmazás `healthy`.
- A HTTP automatikusan HTTPS-re irányít.
- A főoldal, hírek, események, galéria, dokumentumok és társulat oldal működik.
- A magyar, román és angol URL-ek megnyílnak.
- Az `/admin` belépés működik.
- Hír, esemény és galéria létrehozható, módosítható és törölhető.
- Kép- és dokumentumfeltöltés működik.
- A feltöltések konténer-újraindítás után is elérhetők.
- Az adatbázis tartalma konténer-újraindítás után is megmarad.
- A HTTPS-tanúsítvány automatikus megújítása működik.
- Az automatikus mentés elkészül, és a visszaállítás kipróbált.
