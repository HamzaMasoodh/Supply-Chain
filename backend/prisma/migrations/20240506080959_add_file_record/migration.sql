-- CreateTable
CREATE TABLE "FileRecord" (
    "id" SERIAL NOT NULL,
    "directoryName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,

    CONSTRAINT "FileRecord_pkey" PRIMARY KEY ("id")
);
