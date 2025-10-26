/**
 * Prediction Scheduler Module
 * Automates restock predictions and notifications
 * Optimized for Cloudflare Workers with Durable Objects
 */

import { restockPredictor, type ProductData, type SalesHistory, type SupplierCosts, type RestockPrediction } from './restock-predictor';

export interface SchedulerConfig {
  dailyPredictionTime: string; // HH:MM format
  criticalStockThreshold: number;
  enableNotifications: boolean;
  retentionDays: number;
}

export interface PredictionRecord {
  id: string;
  productId: string;
  timestamp: Date;
  prediction: RestockPrediction;
  archived: boolean;
}

export interface NotificationTrigger {
  type: 'critical' | 'reorder' | 'summary';
  productId?: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  data: any;
}

/**
 * Scheduled Prediction Manager
 * Handles automated prediction generation and archiving
 */
export class PredictionScheduler {
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig) {
    this.config = config;
  }

  /**
   * Run daily predictions for all products
   * Should be triggered by Cloudflare Workers Cron
   */
  async runDailyPredictions(
    products: ProductData[],
    salesHistories: Map<string, SalesHistory>,
    supplierCosts?: Map<string, SupplierCosts>
  ): Promise<{
    predictions: RestockPrediction[];
    notifications: NotificationTrigger[];
    summary: PredictionSummary;
  }> {
    console.log(`[PredictionScheduler] Starting daily predictions for ${products.length} products`);

    // Generate predictions
    const predictions = await restockPredictor.predictRestockBatch(
      products,
      salesHistories,
      supplierCosts
    );

    // Generate notifications
    const notifications = this.generateNotifications(predictions);

    // Calculate summary statistics
    const summary = this.calculateSummary(predictions);

    // Archive old predictions (would be implemented with D1/KV storage)
    await this.archiveOldPredictions();

    console.log(`[PredictionScheduler] Generated ${predictions.length} predictions, ${notifications.length} notifications`);

    return { predictions, notifications, summary };
  }

  /**
   * Update predictions based on new sales data
   * Can be triggered on-demand when new sales are recorded
   */
  async updatePredictionsForProduct(
    productId: string,
    product: ProductData,
    salesHistory: SalesHistory,
    supplierCosts?: SupplierCosts
  ): Promise<{
    prediction: RestockPrediction;
    notifications: NotificationTrigger[];
  }> {
    console.log(`[PredictionScheduler] Updating prediction for product ${productId}`);

    const prediction = await restockPredictor.predictRestock(
      product,
      salesHistory,
      supplierCosts
    );

    const notifications = this.generateNotificationsForProduct(prediction);

    return { prediction, notifications };
  }

  /**
   * Generate notifications based on predictions
   */
  private generateNotifications(predictions: RestockPrediction[]): NotificationTrigger[] {
    const notifications: NotificationTrigger[] = [];

    // Critical stock notifications
    const critical = predictions.filter(p => p.urgency === 'critical');
    for (const pred of critical) {
      notifications.push({
        type: 'critical',
        productId: pred.productId,
        message: `URGENT: ${pred.productName} is at critical stock level (${pred.currentStock} units, ${pred.daysOfSupply.toFixed(1)} days)`,
        priority: 'high',
        data: {
          currentStock: pred.currentStock,
          reorderPoint: pred.reorderPoint,
          recommendedQuantity: pred.recommendedOrderQuantity
        }
      });
    }

    // Reorder notifications
    const needsReorder = predictions.filter(
      p => p.shouldReorder && p.urgency !== 'critical'
    );
    for (const pred of needsReorder) {
      notifications.push({
        type: 'reorder',
        productId: pred.productId,
        message: `${pred.productName} needs restocking. Order ${pred.recommendedOrderQuantity} units.`,
        priority: pred.urgency === 'high' ? 'high' : 'medium',
        data: {
          currentStock: pred.currentStock,
          recommendedQuantity: pred.recommendedOrderQuantity,
          estimatedCost: pred.estimatedOrderCost
        }
      });
    }

    // Daily summary notification
    if (this.config.enableNotifications) {
      const summary = this.calculateSummary(predictions);
      notifications.push({
        type: 'summary',
        message: `Daily Inventory Summary: ${summary.totalProducts} products analyzed, ${summary.needsReorder} need restocking, ${summary.critical} critical`,
        priority: 'low',
        data: summary
      });
    }

    return notifications;
  }

  /**
   * Generate notifications for a single product
   */
  private generateNotificationsForProduct(prediction: RestockPrediction): NotificationTrigger[] {
    const notifications: NotificationTrigger[] = [];

    if (prediction.urgency === 'critical') {
      notifications.push({
        type: 'critical',
        productId: prediction.productId,
        message: `URGENT: ${prediction.productName} is at critical stock level`,
        priority: 'high',
        data: prediction
      });
    } else if (prediction.shouldReorder) {
      notifications.push({
        type: 'reorder',
        productId: prediction.productId,
        message: `${prediction.productName} needs restocking`,
        priority: prediction.urgency === 'high' ? 'high' : 'medium',
        data: prediction
      });
    }

    return notifications;
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummary(predictions: RestockPrediction[]): PredictionSummary {
    const needsReorder = predictions.filter(p => p.shouldReorder);
    const critical = predictions.filter(p => p.urgency === 'critical');
    const high = predictions.filter(p => p.urgency === 'high');

    const totalValue = predictions.reduce((sum, p) => sum + p.estimatedValue, 0);
    const totalOrderCost = needsReorder.reduce((sum, p) => sum + p.estimatedOrderCost, 0);

    const byClass = {
      A: predictions.filter(p => p.abcClass === 'A').length,
      B: predictions.filter(p => p.abcClass === 'B').length,
      C: predictions.filter(p => p.abcClass === 'C').length
    };

    const byHealth = {
      healthy: predictions.filter(p => p.inventoryHealth.optimalStatus === 'healthy').length,
      warning: predictions.filter(p => p.inventoryHealth.optimalStatus === 'warning').length,
      critical: predictions.filter(p => p.inventoryHealth.optimalStatus === 'critical').length
    };

    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    return {
      totalProducts: predictions.length,
      needsReorder: needsReorder.length,
      critical: critical.length,
      high: high.length,
      totalInventoryValue: totalValue,
      totalEstimatedOrderCost: totalOrderCost,
      byABCClass: byClass,
      byHealthStatus: byHealth,
      averageConfidence: avgConfidence,
      timestamp: new Date()
    };
  }

  /**
   * Archive old predictions
   * In production, this would write to D1 or KV storage
   */
  private async archiveOldPredictions(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    console.log(`[PredictionScheduler] Archiving predictions older than ${cutoffDate.toISOString()}`);

    // Implementation would depend on storage backend
    // Example: await this.storage.archivePredictions(cutoffDate);
  }

  /**
   * Get historical prediction accuracy
   * Compare predicted demand vs actual sales
   */
  async calculatePredictionAccuracy(
    historicalPredictions: PredictionRecord[],
    actualSales: Map<string, number>
  ): Promise<AccuracyMetrics> {
    const accuracyScores: number[] = [];

    for (const record of historicalPredictions) {
      const predicted = record.prediction.predictedDemand.daily;
      const actual = actualSales.get(record.productId) ?? 0;

      if (predicted > 0) {
        // Mean Absolute Percentage Error (MAPE)
        const ape = Math.abs((actual - predicted) / actual);
        accuracyScores.push(1 - Math.min(1, ape)); // Convert to accuracy score
      }
    }

    const avgAccuracy = accuracyScores.length > 0
      ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
      : 0;

    return {
      averageAccuracy: avgAccuracy,
      totalPredictions: historicalPredictions.length,
      evaluatedPredictions: accuracyScores.length,
      accuracyScore: avgAccuracy >= 0.8 ? 'excellent' : avgAccuracy >= 0.6 ? 'good' : 'needs-improvement'
    };
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(
    predictions: RestockPrediction[],
    historicalPredictions: PredictionRecord[],
    actualSales: Map<string, number>
  ): Promise<PerformanceReport> {
    const summary = this.calculateSummary(predictions);
    const accuracy = await this.calculatePredictionAccuracy(historicalPredictions, actualSales);

    // Identify best and worst performers
    const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
    const topPerformers = sorted.slice(0, 5);
    const needsAttention = sorted.slice(-5).reverse();

    return {
      summary,
      accuracy,
      topPerformers: topPerformers.map(p => ({
        productId: p.productId,
        productName: p.productName,
        confidence: p.confidence,
        turnoverRatio: p.inventoryHealth.turnoverRatio
      })),
      needsAttention: needsAttention.map(p => ({
        productId: p.productId,
        productName: p.productName,
        confidence: p.confidence,
        warnings: p.warnings
      })),
      timestamp: new Date()
    };
  }
}

/**
 * Cloudflare Workers Cron Handler
 * Add this to wrangler.toml:
 * [triggers]
 * crons = ["0 2 * * *"]  # Run at 2 AM daily
 */
export async function handleScheduledPredictions(
  scheduler: PredictionScheduler,
  env: any
): Promise<Response> {
  try {
    // Fetch products from database
    // const products = await env.DB.prepare('SELECT * FROM products').all();
    // const salesHistories = await fetchSalesHistories(env.DB);

    // For now, return placeholder
    console.log('[CronHandler] Scheduled prediction job triggered');

    // Run predictions
    // const result = await scheduler.runDailyPredictions(products, salesHistories);

    // Send notifications
    // await sendNotifications(result.notifications, env);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[CronHandler] Error in scheduled predictions:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Type definitions
export interface PredictionSummary {
  totalProducts: number;
  needsReorder: number;
  critical: number;
  high: number;
  totalInventoryValue: number;
  totalEstimatedOrderCost: number;
  byABCClass: { A: number; B: number; C: number };
  byHealthStatus: { healthy: number; warning: number; critical: number };
  averageConfidence: number;
  timestamp: Date;
}

export interface AccuracyMetrics {
  averageAccuracy: number;
  totalPredictions: number;
  evaluatedPredictions: number;
  accuracyScore: 'excellent' | 'good' | 'needs-improvement';
}

export interface PerformanceReport {
  summary: PredictionSummary;
  accuracy: AccuracyMetrics;
  topPerformers: Array<{
    productId: string;
    productName: string;
    confidence: number;
    turnoverRatio: number;
  }>;
  needsAttention: Array<{
    productId: string;
    productName: string;
    confidence: number;
    warnings: string[];
  }>;
  timestamp: Date;
}
