-- Baseline schema for fresh installations. Existing databases must mark this
-- migration as applied before running `prisma migrate deploy`.
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME,
    "location" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isBookable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "RunningPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleRo" TEXT,
    "titleEn" TEXT,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "summaryRo" TEXT,
    "summaryEn" TEXT,
    "coverImageUrl" TEXT NOT NULL,
    "isGalleryOnly" BOOLEAN NOT NULL DEFAULT false,
    "galleryIsPublished" BOOLEAN NOT NULL DEFAULT true,
    "gallerySortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "RunningPerformanceGalleryImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runningPerformanceId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RunningPerformanceGalleryImage_runningPerformanceId_fkey" FOREIGN KEY ("runningPerformanceId") REFERENCES "RunningPerformance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "RunningPerformanceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runningPerformanceId" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "ticketMode" TEXT NOT NULL DEFAULT 'LINK',
    "ticketUrl" TEXT NOT NULL,
    "ticketText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RunningPerformanceEvent_runningPerformanceId_fkey" FOREIGN KEY ("runningPerformanceId") REFERENCES "RunningPerformance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "NewsPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locale" TEXT NOT NULL DEFAULT 'hu',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "roleRo" TEXT,
    "roleEn" TEXT,
    "bio" TEXT,
    "bioRo" TEXT,
    "bioEn" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'main',
    "groupImageUrl" TEXT,
    "introText" TEXT,
    "introTextRo" TEXT,
    "introTextEn" TEXT,
    "directorName" TEXT,
    "directorNameRo" TEXT,
    "directorNameEn" TEXT,
    "directorTitle" TEXT,
    "directorBio" TEXT,
    "directorBioRo" TEXT,
    "directorBioEn" TEXT,
    "directorImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "GalleryAlbum" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "DefaultCoverImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE UNIQUE INDEX "RunningPerformance_slug_key" ON "RunningPerformance"("slug");
CREATE INDEX "RunningPerformanceGalleryImage_runningPerformanceId_idx" ON "RunningPerformanceGalleryImage"("runningPerformanceId");
CREATE INDEX "RunningPerformanceEvent_runningPerformanceId_idx" ON "RunningPerformanceEvent"("runningPerformanceId");
CREATE INDEX "RunningPerformanceEvent_startsAt_idx" ON "RunningPerformanceEvent"("startsAt");
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "NewsPost"("slug");
CREATE UNIQUE INDEX "GalleryAlbum_slug_key" ON "GalleryAlbum"("slug");
