import {
  BTC_USD,
  CURRENT_YEAR,
  EARLIEST_BTC_YEAR,
  EGYPT_CPI,
  GOLD_USD,
  USD_EGP,
  getFxRate,
  type CurrencyCode,
  type Year,
} from "./historical-data";

export interface CalculationInput {
  amountEGP: number;
  year: Year;
  currency: CurrencyCode;
}

export type HoldingUnit = "oz" | "BTC" | CurrencyCode;

export interface ScenarioResult {
  valueEGP: number;
  multiplier: number;
  cagr: number;
  realMultiplier: number;
  holdings?: { amount: number; unit: HoldingUnit };
  unavailable?: boolean;
}

export interface CalculationOutput {
  amountEGP: number;
  year: Year;
  yearsElapsed: number;
  inflation: ScenarioResult;
  gold: ScenarioResult;
  bitcoin: ScenarioResult;
  foreign: ScenarioResult;
  currency: CurrencyCode;
}

function cagr(start: number, end: number, years: number): number {
  if (start <= 0 || years <= 0) return 0;
  return Math.pow(end / start, 1 / years) - 1;
}

export function calculate(input: CalculationInput): CalculationOutput {
  const { amountEGP, year, currency } = input;
  const yearsElapsed = CURRENT_YEAR - year;

  const cpiThen = EGYPT_CPI[year];
  const cpiNow = EGYPT_CPI[CURRENT_YEAR];
  const inflationFactor = cpiNow / cpiThen;
  const inflationValue = amountEGP * inflationFactor;

  const inflation: ScenarioResult = {
    valueEGP: inflationValue,
    multiplier: inflationFactor,
    cagr: cagr(amountEGP, inflationValue, yearsElapsed),
    realMultiplier: 1,
  };

  // Gold scenario: convert EGP -> USD at historical rate, buy gold, hold,
  // sell gold now in USD, convert back to EGP at current rate.
  const usdThen = USD_EGP[year];
  const usdNow = USD_EGP[CURRENT_YEAR];
  const goldThen = GOLD_USD[year];
  const goldNow = GOLD_USD[CURRENT_YEAR];

  const amountUSDThen = amountEGP / usdThen;
  const ounces = amountUSDThen / goldThen;
  const goldValueUSDNow = ounces * goldNow;
  const goldValueEGPNow = goldValueUSDNow * usdNow;

  const gold: ScenarioResult = {
    valueEGP: goldValueEGPNow,
    multiplier: goldValueEGPNow / amountEGP,
    cagr: cagr(amountEGP, goldValueEGPNow, yearsElapsed),
    realMultiplier: goldValueEGPNow / inflationValue,
    holdings: { amount: ounces, unit: "oz" },
  };

  // Bitcoin scenario (only available from 2010 onwards).
  let bitcoin: ScenarioResult;
  if (year < EARLIEST_BTC_YEAR) {
    bitcoin = {
      valueEGP: 0,
      multiplier: 0,
      cagr: 0,
      realMultiplier: 0,
      unavailable: true,
    };
  } else {
    const btcThen = BTC_USD[year];
    const btcNow = BTC_USD[CURRENT_YEAR];
    const btcUnits = amountUSDThen / btcThen;
    const btcValueUSDNow = btcUnits * btcNow;
    const btcValueEGPNow = btcValueUSDNow * usdNow;

    bitcoin = {
      valueEGP: btcValueEGPNow,
      multiplier: btcValueEGPNow / amountEGP,
      cagr: cagr(amountEGP, btcValueEGPNow, yearsElapsed),
      realMultiplier: btcValueEGPNow / inflationValue,
      holdings: { amount: btcUnits, unit: "BTC" },
    };
  }

  // Foreign currency scenario: convert at historical rate, hold as cash,
  // value now at today's rate.
  const fxThen = getFxRate(currency, year);
  const fxNow = getFxRate(currency, CURRENT_YEAR);

  let foreign: ScenarioResult;
  if (fxThen == null || fxNow == null) {
    foreign = {
      valueEGP: 0,
      multiplier: 0,
      cagr: 0,
      realMultiplier: 0,
      unavailable: true,
    };
  } else {
    const foreignHeld = amountEGP / fxThen;
    const foreignValueEGPNow = foreignHeld * fxNow;
    foreign = {
      valueEGP: foreignValueEGPNow,
      multiplier: foreignValueEGPNow / amountEGP,
      cagr: cagr(amountEGP, foreignValueEGPNow, yearsElapsed),
      realMultiplier: foreignValueEGPNow / inflationValue,
      holdings: { amount: foreignHeld, unit: currency },
    };
  }

  return {
    amountEGP,
    year,
    yearsElapsed,
    inflation,
    gold,
    bitcoin,
    foreign,
    currency,
  };
}

export type Language = "ar" | "en";

function localeFor(lang: Language): string {
  // Arabic with Latin digits so numbers stay readable alongside Arabic labels.
  return lang === "ar" ? "ar-EG-u-nu-latn" : "en-EG";
}

export function formatEGP(value: number, lang: Language): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(localeFor(lang), {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, lang: Language, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(localeFor(lang), {
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(
  value: number,
  lang: Language,
  digits = 1
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(localeFor(lang), {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatMultiplier(value: number, lang: Language): string {
  if (!Number.isFinite(value) || value === 0) return "—";
  const digits = value >= 10 ? 0 : value >= 1 ? 2 : 3;
  const num = new Intl.NumberFormat(localeFor(lang), {
    maximumFractionDigits: digits,
    minimumFractionDigits: value >= 10 ? 0 : digits,
  }).format(value);
  return `${num}×`;
}
import { 
  getCPI, getGoldPrice, getBTCPrice, getFXRate,
  getProjectedCPI, getProjectedGoldPrice, getProjectedBTCPrice, getProjectedFXRate,
  FORECAST_ASSUMPTIONS 
} from './historical-data';

export interface ForecastResult {
  year: number;
  inflationAdjusted: number;
  goldAdjusted: number;
  bitcoinAdjusted: number | null;
  egpInflationOnly: number;
}

export function calculateFutureValue(
  amount: number,
  fromYear: number,
  toYear: number,
  currentCpi: number,
  currentGoldUsd: number,
  currentBtcUsd: number,
  currentFxRate: number,
  currentYear: number
): ForecastResult {
  // Get historical CPI for the starting year
  const fromCPI = getCPI(fromYear);
  
  // Project future values year by year
  let inflationAdjusted = amount;
  let goldAdjusted = amount;
  let bitcoinAdjusted = amount;
  let egpInflationOnly = amount;
  
  for (let year = fromYear + 1; year <= toYear; year++) {
    if (year <= currentYear) {
      // Use historical data
      const yearCPI = getCPI(year);
      inflationAdjusted = amount * (yearCPI / fromCPI);
      
      // For gold/BTC, need full historical calculation
      if (year === toYear) {
        const historicalGold = calculateGoldHistorical(amount, fromYear, year);
        const historicalBTC = calculateBTCHistorical(amount, fromYear, year);
        goldAdjusted = historicalGold;
        bitcoinAdjusted = historicalBTC;
        egpInflationOnly = amount * Math.pow(1 + getHistoricalInflationRate(year), year - fromYear);
      }
    } else {
      // Use forecasts
      const projectedCPI = getProjectedCPI(year, getCPI(currentYear), currentYear);
      inflationAdjusted = amount * (projectedCPI / fromCPI);
      
      const projectedGold = getProjectedGoldPrice(year, currentGoldUsd, currentYear);
      const projectedBTC = getProjectedBTCPrice(year, currentBtcUsd, currentYear);
      const projectedFX = getProjectedFXRate(year, currentFxRate, currentYear);
      
      // Convert EGP → USD at historical rate, buy asset, sell at projected price
      const historicalFX = getFXRate(fromYear);
      const usdAmount = amount / historicalFX;
      
      goldAdjusted = (usdAmount / getGoldPrice(fromYear)) * projectedGold * projectedFX;
      
      if (fromYear >= 2010) {
        bitcoinAdjusted = (usdAmount / getBTCPrice(fromYear)) * projectedBTC * projectedFX;
      } else {
        bitcoinAdjusted = null;
      }
      
      egpInflationOnly = amount * Math.pow(1 + FORECAST_ASSUMPTIONS.inflation, year - fromYear);
    }
  }
  
  return {
    year: toYear,
    inflationAdjusted,
    goldAdjusted,
    bitcoinAdjusted,
    egpInflationOnly
  };
}

function getHistoricalInflationRate(year: number): number {
  // You can extract actual year-over-year inflation from CPI data
  // For now, return assumption
  return 0.25;
}

function calculateGoldHistorical(amount: number, fromYear: number, toYear: number): number {
  const historicalFXFrom = getFXRate(fromYear);
  const historicalFXTo = getFXRate(toYear);
  const goldFrom = getGoldPrice(fromYear);
  const goldTo = getGoldPrice(toYear);
  
  const usdAmount = amount / historicalFXFrom;
  const goldOunces = usdAmount / goldFrom;
  const usdFinal = goldOunces * goldTo;
  
  return usdFinal * historicalFXTo;
}

function calculateBTCHistorical(amount: number, fromYear: number, toYear: number): number {
  if (fromYear < 2010) return null;
  
  const historicalFXFrom = getFXRate(fromYear);
  const historicalFXTo = getFXRate(toYear);
  const btcFrom = getBTCPrice(fromYear);
  const btcTo = getBTCPrice(toYear);
  
  const usdAmount = amount / historicalFXFrom;
  const btcAmount = usdAmount / btcFrom;
  const usdFinal = btcAmount * btcTo;
  
  return usdFinal * historicalFXTo;
}
