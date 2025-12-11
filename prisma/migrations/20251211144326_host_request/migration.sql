-- CreateEnum
CREATE TYPE "HostRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "HostRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "HostRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HostRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostRequest_userId_key" ON "HostRequest"("userId");

-- AddForeignKey
ALTER TABLE "HostRequest" ADD CONSTRAINT "HostRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
