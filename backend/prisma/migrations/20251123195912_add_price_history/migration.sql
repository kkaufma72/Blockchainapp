-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" REAL NOT NULL,
    "volume" REAL,
    "high" REAL,
    "low" REAL,
    "open" REAL,
    "close" REAL,
    "source" TEXT NOT NULL DEFAULT 'coingecko'
);

-- CreateIndex
CREATE INDEX "price_history_timestamp_idx" ON "price_history"("timestamp");
