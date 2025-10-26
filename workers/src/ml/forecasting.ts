/**
 * Forecasting Utilities Module
 * Provides time series analysis and forecasting algorithms
 * Optimized for Cloudflare Workers runtime
 */

export interface TimeSeriesData {
  timestamp: number;
  value: number;
}

export interface ForecastResult {
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalityFactor: number;
}

export interface TrendAnalysis {
  slope: number;
  intercept: number;
  rSquared: number;
  direction: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Calculate Simple Moving Average
 * @param data Historical data points
 * @param period Number of periods to average
 */
export function simpleMovingAverage(data: number[], period: number): number[] {
  if (data.length < period) {
    return data.map(() => data.reduce((a, b) => a + b, 0) / data.length);
  }

  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // Not enough data yet, use available data
      const slice = data.slice(0, i + 1);
      sma.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      sma.push(slice.reduce((a, b) => a + b, 0) / period);
    }
  }
  return sma;
}

/**
 * Calculate Exponential Moving Average
 * More weight to recent data points
 * @param data Historical data points
 * @param period Smoothing period
 */
export function exponentialMovingAverage(data: number[], period: number): number[] {
  if (data.length === 0) return [];

  const alpha = 2 / (period + 1); // Smoothing factor
  const ema: number[] = [data[0]]; // Start with first value

  for (let i = 1; i < data.length; i++) {
    const value = alpha * data[i] + (1 - alpha) * ema[i - 1];
    ema.push(value);
  }

  return ema;
}

/**
 * Calculate Weighted Moving Average
 * Linear weights, most recent data has highest weight
 */
export function weightedMovingAverage(data: number[], period: number): number[] {
  if (data.length < period) period = data.length;

  const wma: number[] = [];
  const weights = Array.from({ length: period }, (_, i) => i + 1);
  const sumWeights = weights.reduce((a, b) => a + b, 0);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      const currentPeriod = i + 1;
      const currentWeights = Array.from({ length: currentPeriod }, (_, j) => j + 1);
      const currentSumWeights = currentWeights.reduce((a, b) => a + b, 0);
      const slice = data.slice(0, i + 1);
      const weighted = slice.reduce((sum, val, idx) => sum + val * currentWeights[idx], 0);
      wma.push(weighted / currentSumWeights);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const weighted = slice.reduce((sum, val, idx) => sum + val * weights[idx], 0);
      wma.push(weighted / sumWeights);
    }
  }

  return wma;
}

/**
 * Linear Regression for Trend Analysis
 * Uses least squares method
 */
export function linearRegression(data: number[]): TrendAnalysis {
  const n = data.length;
  if (n === 0) {
    return { slope: 0, intercept: 0, rSquared: 0, direction: 'stable' };
  }

  // Create x values (time indices)
  const x = Array.from({ length: n }, (_, i) => i);
  const y = data;

  // Calculate means
  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += (x[i] - xMean) ** 2;
  }

  const slope = denominator === 0 ? 0 : numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Calculate R-squared
  const yPredicted = x.map(xi => slope * xi + intercept);
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - yPredicted[i]) ** 2, 0);
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  // Determine direction
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(slope) > 0.1) {
    direction = slope > 0 ? 'increasing' : 'decreasing';
  }

  return { slope, intercept, rSquared, direction };
}

/**
 * Predict next value using linear regression
 */
export function predictNextValue(data: number[]): number {
  const { slope, intercept } = linearRegression(data);
  const nextIndex = data.length;
  return Math.max(0, slope * nextIndex + intercept); // Prevent negative predictions
}

/**
 * Detect Seasonality using autocorrelation
 * Returns seasonality period if detected, 0 otherwise
 */
export function detectSeasonality(data: number[], maxPeriod: number = 12): number {
  if (data.length < maxPeriod * 2) return 0;

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.length;

  if (variance === 0) return 0;

  let maxCorrelation = 0;
  let seasonalPeriod = 0;

  for (let lag = 1; lag <= maxPeriod; lag++) {
    let correlation = 0;
    const n = data.length - lag;

    for (let i = 0; i < n; i++) {
      correlation += (data[i] - mean) * (data[i + lag] - mean);
    }

    correlation = correlation / (n * variance);

    if (correlation > maxCorrelation && correlation > 0.5) {
      maxCorrelation = correlation;
      seasonalPeriod = lag;
    }
  }

  return seasonalPeriod;
}

/**
 * Calculate seasonal indices for each period
 * Returns array of seasonal factors (1.0 = average)
 */
export function calculateSeasonalIndices(data: number[], period: number): number[] {
  if (period === 0 || data.length < period * 2) {
    return Array(period).fill(1.0);
  }

  // Detrend data using moving average
  const detrended = simpleMovingAverage(data, period);

  // Calculate seasonal indices for each position in period
  const seasonalSums = Array(period).fill(0);
  const seasonalCounts = Array(period).fill(0);

  for (let i = 0; i < data.length; i++) {
    const seasonIndex = i % period;
    if (detrended[i] !== 0) {
      seasonalSums[seasonIndex] += data[i] / detrended[i];
      seasonalCounts[seasonIndex]++;
    }
  }

  // Calculate average seasonal index for each position
  const seasonalIndices = seasonalSums.map((sum, i) =>
    seasonalCounts[i] > 0 ? sum / seasonalCounts[i] : 1.0
  );

  // Normalize so average is 1.0
  const avgIndex = seasonalIndices.reduce((a, b) => a + b, 0) / period;
  return seasonalIndices.map(idx => avgIndex !== 0 ? idx / avgIndex : 1.0);
}

/**
 * Calculate demand variance (coefficient of variation)
 * Lower variance = more predictable demand
 */
export function calculateDemandVariance(data: number[]): {
  variance: number;
  standardDeviation: number;
  coefficientOfVariation: number;
} {
  if (data.length === 0) {
    return { variance: 0, standardDeviation: 0, coefficientOfVariation: 0 };
  }

  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = mean !== 0 ? standardDeviation / mean : 0;

  return { variance, standardDeviation, coefficientOfVariation };
}

/**
 * Advanced forecasting combining multiple methods
 * Uses weighted average of SMA, EMA, and trend prediction
 */
export function hybridForecast(data: number[], periods: number = 7): ForecastResult {
  if (data.length === 0) {
    return { predicted: 0, confidence: 0, trend: 'stable', seasonalityFactor: 1.0 };
  }

  // Calculate different forecasts
  const sma = simpleMovingAverage(data, periods);
  const ema = exponentialMovingAverage(data, periods);
  const trend = linearRegression(data);
  const nextTrend = predictNextValue(data);

  // Weight recent methods more heavily
  const lastSMA = sma[sma.length - 1];
  const lastEMA = ema[ema.length - 1];

  // Weighted combination: 30% SMA, 40% EMA, 30% Trend
  const predicted = 0.3 * lastSMA + 0.4 * lastEMA + 0.3 * nextTrend;

  // Calculate confidence based on variance and R-squared
  const { coefficientOfVariation } = calculateDemandVariance(data);
  const varianceConfidence = Math.max(0, 1 - coefficientOfVariation);
  const trendConfidence = trend.rSquared;
  const dataQualityConfidence = Math.min(1, data.length / 30); // More data = more confidence

  const confidence = (varianceConfidence * 0.4 + trendConfidence * 0.3 + dataQualityConfidence * 0.3);

  // Detect seasonality
  const seasonalPeriod = detectSeasonality(data);
  const seasonalityFactor = seasonalPeriod > 0 ? 1.1 : 1.0; // Adjust if seasonal pattern found

  return {
    predicted: Math.max(0, predicted * seasonalityFactor),
    confidence: Math.min(1, Math.max(0, confidence)),
    trend: trend.direction,
    seasonalityFactor
  };
}

/**
 * Calculate sales velocity (units per day)
 */
export function calculateVelocity(data: TimeSeriesData[]): {
  daily: number;
  weekly: number;
  monthly: number;
} {
  if (data.length === 0) {
    return { daily: 0, weekly: 0, monthly: 0 };
  }

  const totalSales = data.reduce((sum, d) => sum + d.value, 0);
  const timeSpan = data[data.length - 1].timestamp - data[0].timestamp;
  const days = timeSpan / (1000 * 60 * 60 * 24);

  if (days === 0) {
    return { daily: totalSales, weekly: totalSales * 7, monthly: totalSales * 30 };
  }

  const daily = totalSales / days;
  const weekly = daily * 7;
  const monthly = daily * 30;

  return { daily, weekly, monthly };
}
