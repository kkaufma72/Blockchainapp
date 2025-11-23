import * as tf from '@tensorflow/tfjs'
import prisma from '../lib/prisma'
import { subDays } from 'date-fns'

interface TrainingData {
  inputs: number[][]
  outputs: number[][]
  metadata: {
    featureCount: number
    outputCount: number
    sampleCount: number
  }
}

interface ModelMetrics {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  loss: number
}

class MLTrainingService {
  private model: tf.Sequential | null = null
  private readonly MODEL_PATH = './ml_models/prediction_model'
  private readonly VERSION = '1.0.0'

  // Prepare training data from historical predictions and actual outcomes
  async prepareTrainingData(days: number = 90): Promise<TrainingData> {
    try {
      // Fetch predictions with their accuracy records
      const accuracyRecords = await prisma.predictionAccuracy.findMany({
        where: {
          evaluatedAt: { gte: subDays(new Date(), days) }
        },
        orderBy: { evaluatedAt: 'asc' },
        take: 1000
      })

      if (accuracyRecords.length === 0) {
        throw new Error('No historical accuracy data available for training')
      }

      // Fetch predictions to get features
      const predictionIds = accuracyRecords.map(r => r.predictionId)
      const predictions = await prisma.predictionModel.findMany({
        where: { id: { in: predictionIds } }
      })

      const predictionMap = new Map(predictions.map(p => [p.id, p]))

      const inputs: number[][] = []
      const outputs: number[][] = []

      for (const accuracy of accuracyRecords) {
        const prediction = predictionMap.get(accuracy.predictionId)
        if (!prediction) continue

        // Parse factors from prediction
        const factors = JSON.parse(prediction.factors)

        // Extract features for ML model
        const features = [
          prediction.currentPrice / 100000, // Normalize price
          prediction.confidence / 100,
          prediction.strength / 10,
          this.riskLevelToNumber(prediction.riskLevel) / 3,
          prediction.sentimentScore || 0,
          ...this.extractFactorFeatures(factors)
        ]

        inputs.push(features)

        // Output: [wasCorrect (0/1), priceDirection (-1/0/1), profitLoss normalized]
        const priceDirection = accuracy.actualPrice > accuracy.predictedPrice ? 1 : 
                               accuracy.actualPrice < accuracy.predictedPrice ? -1 : 0
        outputs.push([
          accuracy.wasCorrect ? 1 : 0,
          (priceDirection + 1) / 2, // Normalize to 0-1
          Math.max(-1, Math.min(1, (accuracy.profitLoss || 0) / 100)) // Normalize P/L
        ])
      }

      return {
        inputs,
        outputs,
        metadata: {
          featureCount: inputs[0]?.length || 0,
          outputCount: outputs[0]?.length || 0,
          sampleCount: inputs.length
        }
      }
    } catch (error) {
      console.error('Error preparing training data:', error)
      throw error
    }
  }

  // Build neural network architecture
  buildModel(inputShape: number, outputShape: number): tf.Sequential {
    const model = tf.sequential({
      layers: [
        // Input layer with feature normalization
        tf.layers.dense({
          inputShape: [inputShape],
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        
        // Hidden layers
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        
        // Output layer
        tf.layers.dense({
          units: outputShape,
          activation: 'sigmoid' // For binary/probability outputs
        })
      ]
    })

    // Compile model with Adam optimizer
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy', 'precision', 'recall']
    })

    return model
  }

  // Train the model with historical data
  async trainModel(epochs: number = 100, batchSize: number = 32): Promise<ModelMetrics> {
    try {
      console.log('🧠 Starting ML model training...')
      
      // Prepare training data
      const trainingData = await this.prepareTrainingData(90)
      
      if (trainingData.inputs.length < 50) {
        throw new Error(`Insufficient training data: ${trainingData.inputs.length} samples (minimum 50 required)`)
      }

      console.log(`📊 Training data: ${trainingData.metadata.sampleCount} samples, ${trainingData.metadata.featureCount} features`)

      // Convert to tensors
      const xs = tf.tensor2d(trainingData.inputs)
      const ys = tf.tensor2d(trainingData.outputs)

      // Build model if not exists
      if (!this.model) {
        this.model = this.buildModel(
          trainingData.metadata.featureCount,
          trainingData.metadata.outputCount
        )
      }

      // Split into training and validation sets (80/20)
      const splitIdx = Math.floor(trainingData.inputs.length * 0.8)
      
      const xsTrain = xs.slice([0, 0], [splitIdx, -1])
      const ysTrain = ys.slice([0, 0], [splitIdx, -1])
      const xsVal = xs.slice([splitIdx, 0], [-1, -1])
      const ysVal = ys.slice([splitIdx, 0], [-1, -1])

      // Train the model
      const history = await this.model.fit(xsTrain, ysTrain, {
        epochs,
        batchSize,
        validationData: [xsVal, ysVal],
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss=${logs?.loss.toFixed(4)}, accuracy=${logs?.acc?.toFixed(4)}`)
            }
          }
        }
      })

      // Evaluate model
      const evaluation = this.model.evaluate(xsVal, ysVal) as tf.Scalar[]
      const loss = await evaluation[0].data()
      const accuracy = await evaluation[1].data()
      const precision = evaluation[2] ? await evaluation[2].data() : [0]
      const recall = evaluation[3] ? await evaluation[3].data() : [0]

      const metrics: ModelMetrics = {
        accuracy: accuracy[0] * 100,
        precision: precision[0] * 100,
        recall: recall[0] * 100,
        f1Score: precision[0] > 0 && recall[0] > 0 
          ? (2 * precision[0] * recall[0] / (precision[0] + recall[0])) * 100 
          : 0,
        loss: loss[0]
      }

      console.log(`✅ Training complete:`)
      console.log(`   Accuracy: ${metrics.accuracy.toFixed(2)}%`)
      console.log(`   Precision: ${metrics.precision.toFixed(2)}%`)
      console.log(`   Recall: ${metrics.recall.toFixed(2)}%`)
      console.log(`   F1 Score: ${metrics.f1Score.toFixed(2)}%`)
      console.log(`   Loss: ${metrics.loss.toFixed(4)}`)

      // Save model to database
      await this.saveModel(metrics, trainingData.metadata)

      // Cleanup tensors
      xs.dispose()
      ys.dispose()
      xsTrain.dispose()
      ysTrain.dispose()
      xsVal.dispose()
      ysVal.dispose()
      evaluation.forEach(t => t.dispose())

      return metrics
    } catch (error) {
      console.error('Error training model:', error)
      throw error
    }
  }

  // Save trained model to database
  async saveModel(metrics: ModelMetrics, metadata: any): Promise<void> {
    try {
      // Deactivate old models
      await prisma.mLModel.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })

      // Save model architecture and weights as JSON
      const architecture = this.model?.toJSON()
      const weights = this.model?.getWeights().map((tensor: tf.Tensor) => 
        Array.from(tensor.dataSync())
      )
      
      await prisma.mLModel.create({
        data: {
          version: `${this.VERSION}-${Date.now()}`,
          modelType: 'neural_network',
          architecture: JSON.stringify(architecture),
          weights: JSON.stringify(weights),
          trainingData: JSON.stringify(metadata),
          accuracy: metrics.accuracy,
          precision: metrics.precision,
          recall: metrics.recall,
          f1Score: metrics.f1Score,
          trainedAt: new Date(),
          isActive: true
        }
      })

      console.log('💾 Model saved to database')
    } catch (error) {
      console.error('Error saving model:', error)
      throw error
    }
  }

  // Load trained model from database
  async loadModel(version?: string): Promise<boolean> {
    try {
      const modelRecord = version 
        ? await prisma.mLModel.findUnique({ where: { version } })
        : await prisma.mLModel.findFirst({ 
            where: { isActive: true },
            orderBy: { trainedAt: 'desc' }
          })

      if (!modelRecord) {
        console.log('No trained model found')
        return false
      }

      const architecture = JSON.parse(modelRecord.architecture)
      const weights = JSON.parse(modelRecord.weights)

      // Reconstruct model from saved data
      this.model = await tf.models.modelFromJSON(architecture) as tf.Sequential
      
      // Set weights
      const weightTensors = weights.map((w: number[]) => tf.tensor(w))
      this.model.setWeights(weightTensors)
      weightTensors.forEach((t: tf.Tensor) => t.dispose())

      console.log(`✅ Loaded model version: ${modelRecord.version}`)
      console.log(`   Accuracy: ${modelRecord.accuracy.toFixed(2)}%`)
      
      return true
    } catch (error) {
      console.error('Error loading model:', error)
      return false
    }
  }

  // Make prediction using trained model
  async predict(features: number[]): Promise<{ confidence: number; direction: number; profitability: number }> {
    if (!this.model) {
      const loaded = await this.loadModel()
      if (!loaded) {
        throw new Error('No trained model available')
      }
    }

    const input = tf.tensor2d([features])
    const prediction = this.model!.predict(input) as tf.Tensor
    const output = await prediction.data()
    
    input.dispose()
    prediction.dispose()

    return {
      confidence: output[0],
      direction: output[1],
      profitability: output[2]
    }
  }

  // Helper methods
  private riskLevelToNumber(risk: string): number {
    const map: { [key: string]: number } = {
      'low': 0,
      'medium': 1,
      'high': 2
    }
    return map[risk] || 1
  }

  private extractFactorFeatures(factors: any[]): number[] {
    // Extract numerical values from factors array
    const features: number[] = []
    
    for (const factor of factors) {
      if (typeof factor.impact === 'number') {
        features.push(factor.impact / 10) // Normalize
      }
    }
    
    // Pad to fixed size (10 features)
    while (features.length < 10) {
      features.push(0)
    }
    
    return features.slice(0, 10)
  }

  // Calculate backtesting metrics
  async calculateBacktestMetrics(days: number = 30): Promise<any> {
    const accuracyRecords = await prisma.predictionAccuracy.findMany({
      where: {
        evaluatedAt: { gte: subDays(new Date(), days) }
      },
      orderBy: { evaluatedAt: 'desc' }
    })

    const total = accuracyRecords.length
    const correct = accuracyRecords.filter(r => r.wasCorrect).length
    const avgProfitLoss = accuracyRecords.reduce((sum, r) => sum + (r.profitLoss || 0), 0) / total
    const avgPriceError = accuracyRecords.reduce((sum, r) => sum + Math.abs(r.priceError), 0) / total

    // Group by recommendation
    const byRecommendation = accuracyRecords.reduce((acc: any, r) => {
      if (!acc[r.recommendation]) {
        acc[r.recommendation] = { total: 0, correct: 0, profitLoss: 0 }
      }
      acc[r.recommendation].total++
      if (r.wasCorrect) acc[r.recommendation].correct++
      acc[r.recommendation].profitLoss += r.profitLoss || 0
      return acc
    }, {})

    return {
      overall: {
        total,
        correct,
        accuracy: (correct / total) * 100,
        avgProfitLoss,
        avgPriceError
      },
      byRecommendation: Object.keys(byRecommendation).map(rec => ({
        recommendation: rec,
        accuracy: (byRecommendation[rec].correct / byRecommendation[rec].total) * 100,
        avgProfitLoss: byRecommendation[rec].profitLoss / byRecommendation[rec].total,
        count: byRecommendation[rec].total
      }))
    }
  }
}

export const mlTrainingService = new MLTrainingService()
