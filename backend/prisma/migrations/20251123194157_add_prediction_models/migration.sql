-- CreateTable
CREATE TABLE "macro_indicators" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "btcPrice" REAL NOT NULL,
    "sp500" REAL,
    "goldPrice" REAL,
    "dollarIndex" REAL,
    "oilPrice" REAL,
    "inflationRate" REAL,
    "interestRate" REAL,
    "vixIndex" REAL,
    "housingIndex" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "geopolitical_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "severity" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "impactOnBTC" REAL,
    "region" TEXT,
    "duration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPrice" REAL NOT NULL,
    "predictedPrice" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "recommendation" TEXT NOT NULL,
    "strength" REAL NOT NULL,
    "timeframe" TEXT NOT NULL,
    "factors" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "entryPrice" REAL,
    "stopLoss" REAL,
    "takeProfit" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "macro_indicators_date_idx" ON "macro_indicators"("date");

-- CreateIndex
CREATE INDEX "geopolitical_events_date_idx" ON "geopolitical_events"("date");

-- CreateIndex
CREATE INDEX "geopolitical_events_type_idx" ON "geopolitical_events"("type");

-- CreateIndex
CREATE INDEX "predictions_timestamp_idx" ON "predictions"("timestamp");

-- CreateIndex
CREATE INDEX "predictions_recommendation_idx" ON "predictions"("recommendation");
