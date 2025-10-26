/**
 * Restock Prediction Engine
 * Main ML module for intelligent inventory replenishment
 * Optimized for Cloudflare Workers runtime
 */

import {
  hybridForecast,
  calculateVelocity,
  calculateDemandVariance,
  detectSeasonality,
  calculateSeasonalIndices,
  type TimeSeriesData
} from './forecasting';

import {
  calculateReorderPoint,
  calculateSafetyStock,
  calculateEOQ,
  calculateOptimalOrderQuantity,
  abcClassification,
  assessInventoryHealth,
  recommendReplenishmentStrategy,
  type InventoryMetrics,
  type ABCClassification,
  type InventoryHealth
} from './inventory-optimizer';

export interface ProductData {
  productId: string;
  name: string;
  currentStock: number;
  unitCost: number;
  sellingPrice: number;
  supplierLeadTime: number; // Days
  supplierLeadTimeVariability?: number; // Days (standard deviation)
  storageCapacity?: number;
  minimumOrderQuantity?: number;
}

export interface SalesHistory {
  productId: string;
  sales: TimeSeriesData[];
}

export interface SupplierCosts {
  orderingCost: number; // Fixed cost per order
  holdingCostRate: number; // Annual holding cost as % of unit cost (e.g., 0.25 = 25%)
  priceBreaks?: Array<{ quantity: number; pricePerUnit: number }>;
}

export interface RestockPrediction {
  productId: string;
  productName: string;

  // Current state
  currentStock: number;
  daysOfSupply: number;

  // Recommendations
  shouldReorder: boolean;
  recommendedOrderQuantity: number;
  reorderPoint: number;
  safetyStock: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';

  // Forecasting
  predictedDemand: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalityFactor: number;

  // Confidence & Quality
  confidence: number; // 0-1 scale
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';

  // Financial
  economicOrderQuantity: number;
  estimatedOrderCost: number;
  estimatedValue: number;

  // Classification
  abcClass?: 'A' | 'B' | 'C';
  inventoryHealth: InventoryHealth;
  replenishmentStrategy: {
    strategy: 'continuous-review' | 'periodic-review' | 'min-max';
    reviewPeriod: number;
    reasoning: string;
  };

  // Timing
  estimatedStockoutDate?: Date;
  recommendedOrderDate: Date;
  expectedDeliveryDate: Date;

  // Additional insights
  warnings: string[];
  insights: string[];
}

/**
 * Main prediction engine
 * Analyzes sales history and generates intelligent restock recommendations
 */
export class RestockPredictor {
  private readonly DEFAULT_SERVICE_LEVEL = 0.95;
  private readonly DEFAULT_ORDERING_COST = 50;
  private readonly DEFAULT_HOLDING_RATE = 0.25;

  /**
   * Generate restock prediction for a single product
   */
  async predictRestock(
    product: ProductData,
    salesHistory: SalesHistory,
    supplierCosts?: SupplierCosts,
    abcClass?: ABCClassification
  ): Promise<RestockPrediction> {
    const warnings: string[] = [];
    const insights: string[] = [];

    // Extract sales data
    const salesValues = salesHistory.sales.map(s => s.value);

    // Handle sparse data
    if (salesValues.length < 7) {
      warnings.push('Limited sales history - predictions may be less accurate');
    }

    if (salesValues.length === 0) {
      return this.createZeroDataPrediction(product, warnings);
    }

    // Calculate velocity
    const velocity = calculateVelocity(salesHistory.sales);

    // Calculate demand statistics
    const demandStats = calculateDemandVariance(salesValues);

    // Forecast future demand
    const forecast = hybridForecast(salesValues, 7);

    // Detect seasonality
    const seasonalPeriod = detectSeasonality(salesValues);
    if (seasonalPeriod > 0) {
      insights.push(`Detected ${seasonalPeriod}-period seasonality pattern`);
    }

    // Calculate inventory metrics
    const inventoryMetrics: InventoryMetrics = {
      averageDemand: velocity.daily,
      demandVariability: demandStats.standardDeviation,
      leadTime: product.supplierLeadTime,
      serviceLevel: this.DEFAULT_SERVICE_LEVEL
    };

    // Calculate reorder point with safety stock
    const reorderPointCalc = calculateReorderPoint(inventoryMetrics);

    // Calculate EOQ
    const orderingCost = supplierCosts?.orderingCost ?? this.DEFAULT_ORDERING_COST;
    const holdingRate = supplierCosts?.holdingCostRate ?? this.DEFAULT_HOLDING_RATE;
    const holdingCost = product.unitCost * holdingRate;
    const annualDemand = velocity.daily * 365;

    let eoq = calculateEOQ(annualDemand, orderingCost, holdingCost);

    // Consider quantity discounts if available
    let optimalQuantity = eoq;
    let orderCost = product.unitCost * eoq;

    if (supplierCosts?.priceBreaks && supplierCosts.priceBreaks.length > 0) {
      const optimal = calculateOptimalOrderQuantity(
        annualDemand,
        orderingCost,
        holdingRate,
        supplierCosts.priceBreaks
      );
      optimalQuantity = optimal.quantity;
      orderCost = optimal.totalCost;

      if (optimal.pricePerUnit < product.unitCost) {
        insights.push(`Bulk discount available: ${optimal.pricePerUnit.toFixed(2)} per unit (save ${((product.unitCost - optimal.pricePerUnit) * optimal.quantity).toFixed(2)})`);
      }
    }

    // Apply constraints
    if (product.minimumOrderQuantity) {
      optimalQuantity = Math.max(optimalQuantity, product.minimumOrderQuantity);
    }

    if (product.storageCapacity) {
      if (optimalQuantity > product.storageCapacity) {
        optimalQuantity = product.storageCapacity;
        warnings.push('Order quantity limited by storage capacity');
      }
    }

    // Calculate days of supply
    const daysOfSupply = velocity.daily > 0 ? product.currentStock / velocity.daily : Infinity;

    // Assess inventory health
    const inventoryHealth = assessInventoryHealth(
      product.currentStock,
      reorderPointCalc.rop,
      salesHistory.sales,
      product.unitCost
    );

    // Determine if should reorder
    const shouldReorder = product.currentStock <= reorderPointCalc.rop;

    // Calculate urgency
    let urgency: 'critical' | 'high' | 'medium' | 'low';
    if (product.currentStock <= reorderPointCalc.safetyStock) {
      urgency = 'critical';
      warnings.push('Stock below safety level - immediate action required');
    } else if (product.currentStock <= reorderPointCalc.rop * 0.5) {
      urgency = 'high';
      warnings.push('Stock approaching critical levels');
    } else if (shouldReorder) {
      urgency = 'medium';
    } else {
      urgency = 'low';
    }

    // Calculate timing
    const estimatedStockoutDate = velocity.daily > 0
      ? new Date(Date.now() + (product.currentStock / velocity.daily) * 24 * 60 * 60 * 1000)
      : undefined;

    const daysUntilReorder = Math.max(0, daysOfSupply - product.supplierLeadTime - (reorderPointCalc.safetyStock / velocity.daily));
    const recommendedOrderDate = new Date(Date.now() + daysUntilReorder * 24 * 60 * 60 * 1000);

    const expectedDeliveryDate = new Date(
      recommendedOrderDate.getTime() + product.supplierLeadTime * 24 * 60 * 60 * 1000
    );

    // Data quality assessment
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (salesValues.length >= 90 && demandStats.coefficientOfVariation < 0.3) {
      dataQuality = 'excellent';
    } else if (salesValues.length >= 30 && demandStats.coefficientOfVariation < 0.5) {
      dataQuality = 'good';
    } else if (salesValues.length >= 14) {
      dataQuality = 'fair';
    } else {
      dataQuality = 'poor';
    }

    // Replenishment strategy
    const replenishmentStrategy = recommendReplenishmentStrategy(
      abcClass?.class ?? 'C',
      demandStats.coefficientOfVariation,
      product.supplierLeadTime
    );

    // Add trend insights
    if (forecast.trend === 'increasing') {
      insights.push('Demand is trending upward - consider increasing safety stock');
    } else if (forecast.trend === 'decreasing') {
      insights.push('Demand is trending downward - monitor for overstocking');
    }

    // Dead stock warning
    if (inventoryHealth.deadStockRisk > 0.5) {
      warnings.push('High dead stock risk - consider reducing order quantities');
    }

    // Turnover insights
    if (inventoryHealth.turnoverRatio < 2) {
      insights.push(`Low turnover ratio (${inventoryHealth.turnoverRatio.toFixed(2)}) - inventory moving slowly`);
    } else if (inventoryHealth.turnoverRatio > 12) {
      insights.push(`High turnover ratio (${inventoryHealth.turnoverRatio.toFixed(2)}) - fast-moving item`);
    }

    return {
      productId: product.productId,
      productName: product.name,
      currentStock: product.currentStock,
      daysOfSupply,
      shouldReorder,
      recommendedOrderQuantity: Math.ceil(optimalQuantity),
      reorderPoint: reorderPointCalc.rop,
      safetyStock: reorderPointCalc.safetyStock,
      urgency,
      predictedDemand: {
        daily: velocity.daily,
        weekly: velocity.weekly,
        monthly: velocity.monthly
      },
      trend: forecast.trend,
      seasonalityFactor: forecast.seasonalityFactor,
      confidence: forecast.confidence * reorderPointCalc.confidence,
      dataQuality,
      economicOrderQuantity: Math.ceil(eoq),
      estimatedOrderCost: orderCost,
      estimatedValue: product.currentStock * product.sellingPrice,
      abcClass: abcClass?.class,
      inventoryHealth,
      replenishmentStrategy,
      estimatedStockoutDate,
      recommendedOrderDate: shouldReorder ? new Date() : recommendedOrderDate,
      expectedDeliveryDate,
      warnings,
      insights
    };
  }

  /**
   * Batch prediction for multiple products
   */
  async predictRestockBatch(
    products: ProductData[],
    salesHistories: Map<string, SalesHistory>,
    supplierCosts?: Map<string, SupplierCosts>
  ): Promise<RestockPrediction[]> {
    // Calculate ABC classification
    const revenueData = products.map(p => {
      const history = salesHistories.get(p.productId);
      const totalSales = history?.sales.reduce((sum, s) => sum + s.value, 0) ?? 0;
      return {
        id: p.productId,
        annualRevenue: totalSales * p.sellingPrice
      };
    });

    const abcClasses = abcClassification(revenueData);

    // Generate predictions in parallel (Promise.all for Workers efficiency)
    const predictions = await Promise.all(
      products.map(async (product) => {
        const history = salesHistories.get(product.productId) ?? { productId: product.productId, sales: [] };
        const costs = supplierCosts?.get(product.productId);
        const abcClass = abcClasses.get(product.productId);

        return this.predictRestock(product, history, costs, abcClass);
      })
    );

    return predictions;
  }

  /**
   * Prioritize restock recommendations
   */
  prioritizeRestocks(predictions: RestockPrediction[]): RestockPrediction[] {
    return predictions
      .filter(p => p.shouldReorder)
      .sort((a, b) => {
        // Priority order: urgency, ABC class, confidence
        const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];

        if (urgencyDiff !== 0) return urgencyDiff;

        // ABC class priority (A > B > C)
        const abcOrder = { A: 0, B: 1, C: 2 };
        const aClass = a.abcClass ?? 'C';
        const bClass = b.abcClass ?? 'C';
        const abcDiff = abcOrder[aClass] - abcOrder[bClass];

        if (abcDiff !== 0) return abcDiff;

        // Higher confidence first
        return b.confidence - a.confidence;
      });
  }

  /**
   * Handle products with no sales data
   */
  private createZeroDataPrediction(
    product: ProductData,
    warnings: string[]
  ): RestockPrediction {
    warnings.push('No sales history available - using conservative estimates');

    return {
      productId: product.productId,
      productName: product.name,
      currentStock: product.currentStock,
      daysOfSupply: Infinity,
      shouldReorder: false,
      recommendedOrderQuantity: product.minimumOrderQuantity ?? 10,
      reorderPoint: product.minimumOrderQuantity ?? 10,
      safetyStock: product.minimumOrderQuantity ?? 5,
      urgency: 'low',
      predictedDemand: { daily: 0, weekly: 0, monthly: 0 },
      trend: 'stable',
      seasonalityFactor: 1.0,
      confidence: 0,
      dataQuality: 'poor',
      economicOrderQuantity: product.minimumOrderQuantity ?? 10,
      estimatedOrderCost: product.unitCost * (product.minimumOrderQuantity ?? 10),
      estimatedValue: product.currentStock * product.sellingPrice,
      inventoryHealth: {
        turnoverRatio: 0,
        daysOfSupply: Infinity,
        deadStockRisk: 1.0,
        understockRisk: 0,
        optimalStatus: 'warning'
      },
      replenishmentStrategy: {
        strategy: 'min-max',
        reviewPeriod: 30,
        reasoning: 'No data available - using simple min-max approach'
      },
      recommendedOrderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + product.supplierLeadTime * 24 * 60 * 60 * 1000),
      warnings,
      insights: ['Collect more sales data to improve predictions']
    };
  }

  /**
   * Calculate perfume-specific adjustments
   * Perfumes have unique characteristics: seasonality, gifting periods, trends
   */
  adjustForPerfumeMarket(
    prediction: RestockPrediction,
    metadata: {
      category?: 'luxury' | 'designer' | 'niche' | 'mass-market';
      season?: 'spring' | 'summer' | 'fall' | 'winter';
      isGiftSeason?: boolean;
      trendingScore?: number; // 0-1
    }
  ): RestockPrediction {
    const adjusted = { ...prediction };

    // Luxury perfumes: higher safety stock, lower turnover acceptable
    if (metadata.category === 'luxury' || metadata.category === 'niche') {
      adjusted.safetyStock = Math.ceil(adjusted.safetyStock * 1.3);
      adjusted.insights.push('Luxury category: Increased safety stock for availability');
    }

    // Gift season (holidays, Valentine's, Mother's Day)
    if (metadata.isGiftSeason) {
      adjusted.recommendedOrderQuantity = Math.ceil(adjusted.recommendedOrderQuantity * 1.5);
      adjusted.urgency = adjusted.urgency === 'low' ? 'medium' : adjusted.urgency;
      adjusted.insights.push('Gift season: Increased order quantity recommended');
    }

    // Trending products
    if (metadata.trendingScore && metadata.trendingScore > 0.7) {
      adjusted.safetyStock = Math.ceil(adjusted.safetyStock * 1.4);
      adjusted.insights.push('Trending product: Higher safety stock to prevent stockouts');
    }

    // Seasonal adjustments
    if (metadata.season) {
      const seasonalFactors = {
        spring: 1.1, // Fresh scents
        summer: 1.15, // Light, citrus scents
        fall: 1.0,
        winter: 1.2 // Rich, warm scents + holidays
      };

      const factor = seasonalFactors[metadata.season];
      adjusted.predictedDemand.daily *= factor;
      adjusted.predictedDemand.weekly *= factor;
      adjusted.predictedDemand.monthly *= factor;
    }

    return adjusted;
  }
}

/**
 * Export singleton instance
 */
export const restockPredictor = new RestockPredictor();
