-- AlterTable
ALTER TABLE "predictions" ADD COLUMN "mlModelVersion" TEXT;
ALTER TABLE "predictions" ADD COLUMN "sentimentScore" REAL;

-- CreateTable
CREATE TABLE "prediction_accuracy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "predictionId" TEXT NOT NULL,
    "predictedPrice" REAL NOT NULL,
    "actualPrice" REAL NOT NULL,
    "priceError" REAL NOT NULL,
    "recommendation" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "profitLoss" REAL,
    "timeframe" TEXT NOT NULL,
    "evaluatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ml_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "architecture" TEXT NOT NULL,
    "weights" TEXT NOT NULL,
    "trainingData" TEXT NOT NULL,
    "accuracy" REAL NOT NULL,
    "precision" REAL,
    "recall" REAL,
    "f1Score" REAL,
    "trainedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "sentiment_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "sentimentScore" REAL NOT NULL,
    "volumeScore" REAL NOT NULL,
    "keywords" TEXT NOT NULL,
    "newsCount" INTEGER,
    "positiveCount" INTEGER,
    "negativeCount" INTEGER,
    "neutralCount" INTEGER,
    "rawData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "prediction_accuracy_predictionId_key" ON "prediction_accuracy"("predictionId");

-- CreateIndex
CREATE INDEX "prediction_accuracy_wasCorrect_idx" ON "prediction_accuracy"("wasCorrect");

-- CreateIndex
CREATE INDEX "prediction_accuracy_timeframe_idx" ON "prediction_accuracy"("timeframe");

-- CreateIndex
CREATE INDEX "prediction_accuracy_evaluatedAt_idx" ON "prediction_accuracy"("evaluatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ml_models_version_key" ON "ml_models"("version");

-- CreateIndex
CREATE INDEX "ml_models_isActive_idx" ON "ml_models"("isActive");

-- CreateIndex
CREATE INDEX "ml_models_accuracy_idx" ON "ml_models"("accuracy");

-- CreateIndex
CREATE INDEX "sentiment_data_timestamp_idx" ON "sentiment_data"("timestamp");

-- CreateIndex
CREATE INDEX "sentiment_data_source_idx" ON "sentiment_data"("source");

-- CreateIndex
CREATE INDEX "sentiment_data_sentimentScore_idx" ON "sentiment_data"("sentimentScore");
