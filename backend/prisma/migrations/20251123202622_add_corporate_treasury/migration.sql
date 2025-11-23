-- CreateTable
CREATE TABLE "corporate_treasury" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "btcHoldings" REAL NOT NULL,
    "ethHoldings" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL,
    "acquisitionCost" REAL,
    "marketValue" REAL,
    "percentOfAssets" REAL,
    "isLeveraged" BOOLEAN NOT NULL DEFAULT false,
    "leverageRatio" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "treasury_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "priceAtTime" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "impact" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "corporate_treasury_company_lastUpdated_idx" ON "corporate_treasury"("company", "lastUpdated");

-- CreateIndex
CREATE INDEX "treasury_events_timestamp_eventType_idx" ON "treasury_events"("timestamp", "eventType");

-- CreateIndex
CREATE INDEX "treasury_events_company_idx" ON "treasury_events"("company");
