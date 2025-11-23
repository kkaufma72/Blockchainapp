-- CreateTable
CREATE TABLE "whale_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "blockHeight" INTEGER,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "value" REAL NOT NULL,
    "usdValue" REAL,
    "classification" TEXT,
    "confidence" REAL,
    "detected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "whale_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "label" TEXT,
    "totalVolume" REAL NOT NULL DEFAULT 0,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "firstSeen" DATETIME NOT NULL,
    "lastSeen" DATETIME NOT NULL,
    "lastBalance" REAL,
    "rank" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "detected_patterns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "addressCount" INTEGER NOT NULL,
    "volume" REAL NOT NULL,
    "timeframeStart" DATETIME NOT NULL,
    "timeframeEnd" DATETIME NOT NULL,
    "impact" TEXT NOT NULL,
    "addresses" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "push" BOOLEAN NOT NULL DEFAULT false,
    "lastTriggered" DATETIME,
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "targetAddress" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "alert_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "whale_transactions_hash_key" ON "whale_transactions"("hash");

-- CreateIndex
CREATE INDEX "whale_transactions_timestamp_idx" ON "whale_transactions"("timestamp");

-- CreateIndex
CREATE INDEX "whale_transactions_fromAddress_idx" ON "whale_transactions"("fromAddress");

-- CreateIndex
CREATE INDEX "whale_transactions_toAddress_idx" ON "whale_transactions"("toAddress");

-- CreateIndex
CREATE INDEX "whale_transactions_value_idx" ON "whale_transactions"("value");

-- CreateIndex
CREATE UNIQUE INDEX "whale_stats_address_key" ON "whale_stats"("address");

-- CreateIndex
CREATE INDEX "whale_stats_totalVolume_idx" ON "whale_stats"("totalVolume");

-- CreateIndex
CREATE INDEX "whale_stats_transactionCount_idx" ON "whale_stats"("transactionCount");

-- CreateIndex
CREATE INDEX "detected_patterns_type_idx" ON "detected_patterns"("type");

-- CreateIndex
CREATE INDEX "detected_patterns_confidence_idx" ON "detected_patterns"("confidence");

-- CreateIndex
CREATE INDEX "detected_patterns_timeframeStart_idx" ON "detected_patterns"("timeframeStart");

-- CreateIndex
CREATE INDEX "alerts_enabled_idx" ON "alerts"("enabled");

-- CreateIndex
CREATE INDEX "alerts_type_idx" ON "alerts"("type");

-- CreateIndex
CREATE INDEX "alert_logs_alertId_idx" ON "alert_logs"("alertId");

-- CreateIndex
CREATE INDEX "alert_logs_sent_idx" ON "alert_logs"("sent");
