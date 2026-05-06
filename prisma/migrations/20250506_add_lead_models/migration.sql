-- CreateTable Lead
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "companyName" TEXT,
    "website" TEXT,
    "niche" TEXT,
    "monthlySpend" TEXT,
    "role" TEXT,
    "challenge" TEXT,
    "source" TEXT NOT NULL DEFAULT 'organic',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "onboardingStep" INTEGER NOT NULL DEFAULT 0,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "hasAudit" BOOLEAN NOT NULL DEFAULT false,
    "auditCount" INTEGER NOT NULL DEFAULT 0,
    "hasClickedExpertAudit" BOOLEAN NOT NULL DEFAULT false,
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "status" TEXT NOT NULL DEFAULT 'new',
    "adminNotes" TEXT,
    "documents" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable LeadActivity
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "performedBy" TEXT DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex Lead
CREATE UNIQUE INDEX "Lead_userId_key" ON "Lead"("userId");
CREATE INDEX "Lead_leadScore_idx" ON "Lead"("leadScore");
CREATE INDEX "Lead_priority_idx" ON "Lead"("priority");
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");

-- CreateIndex LeadActivity
CREATE INDEX "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");
CREATE INDEX "LeadActivity_createdAt_idx" ON "LeadActivity"("createdAt");

-- AddForeignKey Lead -> User
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey LeadActivity -> Lead
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
