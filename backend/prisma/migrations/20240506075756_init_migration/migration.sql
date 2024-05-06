-- CreateTable
CREATE TABLE "Url" (
    "id" SERIAL NOT NULL,
    "URL" TEXT NOT NULL,
    "Reviewed" TEXT,
    "Moved" TEXT,
    "Notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);
