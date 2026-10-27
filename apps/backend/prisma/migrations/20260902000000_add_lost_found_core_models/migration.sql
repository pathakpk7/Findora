-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('ELECTRONICS', 'PHONE', 'EARBUDS', 'WATCH', 'WALLET', 'CASH', 'BOOK', 'NOTEBOOK', 'ID_CARD', 'STUDENT_CARD', 'KEYS', 'BAG', 'CLOTHING', 'ACCESSORY', 'CHARGER', 'OTHER');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CLAIMED', 'RETURN_PENDING', 'RETURNED', 'EXPIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LostReportStatus" AS ENUM ('ACTIVE', 'MATCHED', 'RECOVERED', 'CLOSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "HandoverStatus" AS ENUM ('PENDING', 'SCANNED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ITEM_SUBMITTED', 'ITEM_APPROVED', 'ITEM_REJECTED', 'CLAIM_SUBMITTED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'CLAIM_MORE_EVIDENCE', 'HANDOVER_CREATED', 'HANDOVER_COMPLETED', 'ITEM_RETURNED', 'POSSIBLE_MATCH', 'BADGE_EARNED', 'TRUST_SCORE_CHANGED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ROLE_CHANGED', 'USER_DEACTIVATED', 'USER_REACTIVATED', 'USER_VERIFIED', 'ITEM_APPROVED', 'ITEM_REJECTED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'HANDOVER_COMPLETED', 'TRUST_SCORE_CHANGED');

-- CreateTable
CREATE TABLE "found_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "publicDescription" TEXT NOT NULL,
    "foundLocation" TEXT NOT NULL,
    "foundDate" TIMESTAMP(3) NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'PENDING',
    "publicImages" TEXT[],
    "foundById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "found_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "found_item_verifications" (
    "id" TEXT NOT NULL,
    "foundItemId" TEXT NOT NULL,
    "serialNumber" TEXT,
    "hiddenMarks" TEXT,
    "privateIdentifyingInfo" TEXT,
    "privateNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "found_item_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "lostLocation" TEXT NOT NULL,
    "lostDate" TIMESTAMP(3) NOT NULL,
    "images" TEXT[],
    "identifyingCharacteristics" TEXT,
    "status" "LostReportStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lost_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "foundItemId" TEXT NOT NULL,
    "claimantId" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "reviewerId" TEXT,
    "reviewReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handovers" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "HandoverStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "handovers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_score_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "previousScore" INTEGER NOT NULL,
    "newScore" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_score_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "criteria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "found_items_status_idx" ON "found_items"("status");

-- CreateIndex
CREATE INDEX "found_items_category_idx" ON "found_items"("category");

-- CreateIndex
CREATE INDEX "found_items_foundDate_idx" ON "found_items"("foundDate");

-- CreateIndex
CREATE INDEX "found_items_foundLocation_idx" ON "found_items"("foundLocation");

-- CreateIndex
CREATE INDEX "found_items_foundById_idx" ON "found_items"("foundById");

-- CreateIndex
CREATE INDEX "found_items_createdAt_idx" ON "found_items"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "found_item_verifications_foundItemId_key" ON "found_item_verifications"("foundItemId");

-- CreateIndex
CREATE INDEX "lost_reports_status_idx" ON "lost_reports"("status");

-- CreateIndex
CREATE INDEX "lost_reports_category_idx" ON "lost_reports"("category");

-- CreateIndex
CREATE INDEX "lost_reports_lostDate_idx" ON "lost_reports"("lostDate");

-- CreateIndex
CREATE INDEX "lost_reports_lostLocation_idx" ON "lost_reports"("lostLocation");

-- CreateIndex
CREATE INDEX "lost_reports_reporterId_idx" ON "lost_reports"("reporterId");

-- CreateIndex
CREATE INDEX "claims_foundItemId_idx" ON "claims"("foundItemId");

-- CreateIndex
CREATE INDEX "claims_claimantId_idx" ON "claims"("claimantId");

-- CreateIndex
CREATE INDEX "claims_status_idx" ON "claims"("status");

-- CreateIndex
CREATE INDEX "claims_reviewerId_idx" ON "claims"("reviewerId");

-- CreateIndex
CREATE INDEX "claims_createdAt_idx" ON "claims"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "claims_foundItemId_claimantId_key" ON "claims"("foundItemId", "claimantId");

-- CreateIndex
CREATE UNIQUE INDEX "handovers_claimId_key" ON "handovers"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "handovers_tokenHash_key" ON "handovers"("tokenHash");

-- CreateIndex
CREATE INDEX "handovers_claimId_idx" ON "handovers"("claimId");

-- CreateIndex
CREATE INDEX "handovers_status_idx" ON "handovers"("status");

-- CreateIndex
CREATE INDEX "handovers_tokenHash_idx" ON "handovers"("tokenHash");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_readAt_idx" ON "notifications"("readAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "trust_score_history_userId_idx" ON "trust_score_history"("userId");

-- CreateIndex
CREATE INDEX "trust_score_history_createdAt_idx" ON "trust_score_history"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeId_key" ON "user_badges"("userId", "badgeId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "found_items" ADD CONSTRAINT "found_items_foundById_fkey" FOREIGN KEY ("foundById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "found_item_verifications" ADD CONSTRAINT "found_item_verifications_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "found_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_reports" ADD CONSTRAINT "lost_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_foundItemId_fkey" FOREIGN KEY ("foundItemId") REFERENCES "found_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_score_history" ADD CONSTRAINT "trust_score_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_score_history" ADD CONSTRAINT "trust_score_history_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
