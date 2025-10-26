/**
 * Inventory Optimization Module
 * Provides algorithms for optimal inventory management
 * Optimized for Cloudflare Workers runtime
 */

import { calculateDemandVariance, calculateVelocity, type TimeSeriesData } from './forecasting';

export interface InventoryMetrics {
  averageDemand: number;
  demandVariability: number;
  leadTime: number;
  serviceLevel: number;
}

export interface ReorderPoint {
  rop: number;
  safetyStock: number;
  averageDemandDuringLeadTime: number;
  confidence: number;
}

export interface ABCClassification {
  class: 'A' | 'B' | 'C';
  annualRevenue: number;
  percentageOfTotal: number;
  rank: number;
}

export interface InventoryHealth {
  turnoverRatio: number;
  daysOfSupply: number;
  deadStockRisk: number; // 0-1 scale
  understockRisk: number; // 0-1 scale
  optimalStatus: 'healthy' | 'warning' | 'critical';
}

/**
 * Calculate Reorder Point (ROP)
 * ROP = (Average Daily Demand × Lead Time) + Safety Stock
 *
 * @param metrics Inventory metrics
 * @param zScore Z-score for desired service level (1.65 = 95%, 2.33 = 99%)
 */
export function calculateReorderPoint(
  metrics: InventoryMetrics,
  zScore: number = 1.65
): ReorderPoint {
  const { averageDemand, demandVariability, leadTime, serviceLevel } = metrics;

  // Average demand during lead time
  const averageDemandDuringLeadTime = averageDemand * leadTime;

  // Safety stock calculation
  // SS = Z × σ × √LT
  // where σ is standard deviation of demand and LT is lead time
  const safetyStock = zScore * demandVariability * Math.sqrt(leadTime);

  // Reorder point
  const rop = averageDemandDuringLeadTime + safetyStock;

  // Confidence based on service level and data quality
  const confidence = Math.min(1, serviceLevel * 0.7 + (demandVariability > 0 ? 0.3 : 0));

  return {
    rop: Math.max(0, Math.ceil(rop)),
    safetyStock: Math.max(0, Math.ceil(safetyStock)),
    averageDemandDuringLeadTime: Math.max(0, Math.ceil(averageDemandDuringLeadTime)),
    confidence
  };
}

/**
 * Calculate Safety Stock Level
 * Different methods for different demand patterns
 */
export function calculateSafetyStock(
  averageDemand: number,
  demandStdDev: number,
  leadTime: number,
  leadTimeStdDev: number = 0,
  serviceLevel: number = 0.95
): number {
  // Z-score lookup for service level
  const zScore = getZScore(serviceLevel);

  if (leadTimeStdDev === 0) {
    // Fixed lead time, variable demand
    return zScore * demandStdDev * Math.sqrt(leadTime);
  } else {
    // Variable lead time and demand
    const varianceDemand = demandStdDev ** 2;
    const varianceLeadTime = leadTimeStdDev ** 2;

    const safetyStock = zScore * Math.sqrt(
      leadTime * varianceDemand +
      (averageDemand ** 2) * varianceLeadTime
    );

    return Math.max(0, Math.ceil(safetyStock));
  }
}

/**
 * Get Z-score for service level
 * Approximation for common service levels
 */
function getZScore(serviceLevel: number): number {
  if (serviceLevel >= 0.99) return 2.33;
  if (serviceLevel >= 0.98) return 2.05;
  if (serviceLevel >= 0.95) return 1.65;
  if (serviceLevel >= 0.90) return 1.28;
  if (serviceLevel >= 0.85) return 1.04;
  if (serviceLevel >= 0.80) return 0.84;
  return 0.84; // Default to 80%
}

/**
 * ABC Analysis - Classify products by importance
 * A: Top 20% of products generating 80% of revenue
 * B: Next 30% of products generating 15% of revenue
 * C: Remaining 50% of products generating 5% of revenue
 */
export function abcClassification(
  products: Array<{ id: string; annualRevenue: number }>
): Map<string, ABCClassification> {
  // Sort by revenue descending
  const sorted = [...products].sort((a, b) => b.annualRevenue - a.annualRevenue);

  const totalRevenue = sorted.reduce((sum, p) => sum + p.annualRevenue, 0);

  const classifications = new Map<string, ABCClassification>();
  let cumulativeRevenue = 0;

  sorted.forEach((product, index) => {
    cumulativeRevenue += product.annualRevenue;
    const percentageOfTotal = totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0;

    let productClass: 'A' | 'B' | 'C';
    if (percentageOfTotal <= 80) {
      productClass = 'A';
    } else if (percentageOfTotal <= 95) {
      productClass = 'B';
    } else {
      productClass = 'C';
    }

    classifications.set(product.id, {
      class: productClass,
      annualRevenue: product.annualRevenue,
      percentageOfTotal,
      rank: index + 1
    });
  });

  return classifications;
}

/**
 * Detect Dead Stock
 * Products with no sales in specified period
 */
export function detectDeadStock(
  salesData: TimeSeriesData[],
  thresholdDays: number = 90
): boolean {
  if (salesData.length === 0) return true;

  const now = Date.now();
  const threshold = now - thresholdDays * 24 * 60 * 60 * 1000;

  // Check if there are any sales after threshold date
  const recentSales = salesData.filter(d => d.timestamp > threshold);

  return recentSales.length === 0 || recentSales.reduce((sum, d) => sum + d.value, 0) === 0;
}

/**
 * Calculate Inventory Turnover Ratio
 * Turnover = Cost of Goods Sold / Average Inventory
 * Higher ratio = faster moving inventory
 */
export function calculateTurnoverRatio(
  costOfGoodsSold: number,
  averageInventory: number
): number {
  if (averageInventory === 0) return 0;
  return costOfGoodsSold / averageInventory;
}

/**
 * Calculate Days of Supply
 * How many days current inventory will last at current sales rate
 */
export function calculateDaysOfSupply(
  currentStock: number,
  averageDailyDemand: number
): number {
  if (averageDailyDemand === 0) return Infinity;
  return currentStock / averageDailyDemand;
}

/**
 * Comprehensive Inventory Health Assessment
 */
export function assessInventoryHealth(
  currentStock: number,
  reorderPoint: number,
  salesData: TimeSeriesData[],
  costPerUnit: number
): InventoryHealth {
  const velocity = calculateVelocity(salesData);
  const { daily: averageDailyDemand } = velocity;

  // Calculate turnover ratio (annualized)
  const annualDemand = averageDailyDemand * 365;
  const turnoverRatio = calculateTurnoverRatio(
    annualDemand * costPerUnit,
    currentStock * costPerUnit
  );

  // Days of supply
  const daysOfSupply = calculateDaysOfSupply(currentStock, averageDailyDemand);

  // Dead stock risk (based on low turnover and high days of supply)
  let deadStockRisk = 0;
  if (turnoverRatio < 2) deadStockRisk += 0.3;
  if (daysOfSupply > 180) deadStockRisk += 0.4;
  if (detectDeadStock(salesData, 90)) deadStockRisk += 0.3;
  deadStockRisk = Math.min(1, deadStockRisk);

  // Understock risk (current stock vs reorder point)
  let understockRisk = 0;
  if (currentStock <= reorderPoint) {
    understockRisk = Math.min(1, (reorderPoint - currentStock) / reorderPoint + 0.5);
  }

  // Overall status
  let optimalStatus: 'healthy' | 'warning' | 'critical';
  if (deadStockRisk > 0.6 || understockRisk > 0.7) {
    optimalStatus = 'critical';
  } else if (deadStockRisk > 0.3 || understockRisk > 0.4) {
    optimalStatus = 'warning';
  } else {
    optimalStatus = 'healthy';
  }

  return {
    turnoverRatio,
    daysOfSupply,
    deadStockRisk,
    understockRisk,
    optimalStatus
  };
}

/**
 * Calculate Economic Order Quantity (EOQ)
 * Optimal order quantity that minimizes total inventory costs
 * EOQ = √((2 × D × S) / H)
 * where D = annual demand, S = ordering cost, H = holding cost per unit per year
 */
export function calculateEOQ(
  annualDemand: number,
  orderingCost: number,
  holdingCostPerUnit: number
): number {
  if (holdingCostPerUnit === 0) return 0;

  const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCostPerUnit);
  return Math.max(1, Math.ceil(eoq));
}

/**
 * Calculate optimal order quantity with quantity discounts
 * Considers price breaks and total cost optimization
 */
export function calculateOptimalOrderQuantity(
  annualDemand: number,
  orderingCost: number,
  holdingCostRate: number, // Percentage of unit cost
  priceBreaks: Array<{ quantity: number; pricePerUnit: number }>
): {
  quantity: number;
  totalCost: number;
  pricePerUnit: number;
} {
  // Sort price breaks by quantity
  const sortedBreaks = [...priceBreaks].sort((a, b) => a.quantity - b.quantity);

  let minTotalCost = Infinity;
  let optimalQuantity = 0;
  let optimalPrice = 0;

  for (const priceBreak of sortedBreaks) {
    const { quantity: breakQuantity, pricePerUnit } = priceBreak;
    const holdingCost = pricePerUnit * holdingCostRate;

    // Calculate EOQ for this price point
    const eoq = calculateEOQ(annualDemand, orderingCost, holdingCost);

    // Use EOQ or minimum quantity for this price break, whichever is higher
    const orderQuantity = Math.max(eoq, breakQuantity);

    // Calculate total annual cost
    const purchaseCost = annualDemand * pricePerUnit;
    const orderingCostAnnual = (annualDemand / orderQuantity) * orderingCost;
    const holdingCostAnnual = (orderQuantity / 2) * holdingCost;
    const totalCost = purchaseCost + orderingCostAnnual + holdingCostAnnual;

    if (totalCost < minTotalCost) {
      minTotalCost = totalCost;
      optimalQuantity = orderQuantity;
      optimalPrice = pricePerUnit;
    }
  }

  return {
    quantity: Math.ceil(optimalQuantity),
    totalCost: minTotalCost,
    pricePerUnit: optimalPrice
  };
}

/**
 * Recommend replenishment strategy based on product characteristics
 */
export function recommendReplenishmentStrategy(
  abcClass: 'A' | 'B' | 'C',
  demandVariability: number,
  leadTime: number
): {
  strategy: 'continuous-review' | 'periodic-review' | 'min-max';
  reviewPeriod: number;
  reasoning: string;
} {
  // High-value, high-variability items (A items)
  if (abcClass === 'A') {
    return {
      strategy: 'continuous-review',
      reviewPeriod: 1, // Daily review
      reasoning: 'High-value item requires continuous monitoring to minimize stockouts and excess inventory'
    };
  }

  // Medium-value items (B items)
  if (abcClass === 'B') {
    if (demandVariability > 0.5) {
      return {
        strategy: 'continuous-review',
        reviewPeriod: 7, // Weekly review
        reasoning: 'Moderate value with high variability needs regular review'
      };
    } else {
      return {
        strategy: 'periodic-review',
        reviewPeriod: 14, // Bi-weekly review
        reasoning: 'Moderate value with stable demand can use periodic review'
      };
    }
  }

  // Low-value items (C items)
  return {
    strategy: 'min-max',
    reviewPeriod: 30, // Monthly review
    reasoning: 'Low-value item can use simple min-max system with infrequent review'
  };
}
