ALTER TABLE "CompanyProfile"
ADD COLUMN "facebookUrl" TEXT NOT NULL DEFAULT 'https://www.facebook.com/hargitaegyuttes';

ALTER TABLE "CompanyProfile"
ADD COLUMN "instagramUrl" TEXT NOT NULL DEFAULT 'https://www.instagram.com/hargitaneptancszinhaz';

ALTER TABLE "CompanyProfile"
ADD COLUMN "tiktokUrl" TEXT NOT NULL DEFAULT '#';
