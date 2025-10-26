/**
 * ML Module Index
 * Main entry point for intelligent restock prediction system
 */

// Forecasting utilities
export {
  simpleMovingAverage,
  exponentialMovingAverage,
  weightedMovingAverage,
  linearRegression,
  predictNextValue,
  detectSeasonality,
  calculateSeasonalIndices,
  calculateDemandVariance,
  hybridForecast,
  calculateVelocity,
  type TimeSeriesData,
  type ForecastResult,
  type TrendAnalysis
} from './forecasting';

// Inventory optimization
export {
  calculateReorderPoint,
  calculateSafetyStock,
  calculateEOQ,
  calculateOptimalOrderQuantity,
  abcClassification,
  detectDeadStock,
  calculateTurnoverRatio,
  calculateDaysOfSupply,
  assessInventoryHealth,
  recommendReplenishmentStrategy,
  type InventoryMetrics,
  type ReorderPoint,
  type ABCClassification,
  type InventoryHealth
} from './inventory-optimizer';

// Main restock predictor
export {
  RestockPredictor,
  restockPredictor,
  type ProductData,
  type SalesHistory,
  type SupplierCosts,
  type RestockPrediction
} from './restock-predictor';

// Prediction scheduler
export {
  PredictionScheduler,
  handleScheduledPredictions,
  type SchedulerConfig,
  type PredictionRecord,
  type NotificationTrigger,
  type PredictionSummary,
  type AccuracyMetrics,
  type PerformanceReport
} from './prediction-scheduler';
