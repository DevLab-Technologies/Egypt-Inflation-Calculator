// Historical annual data for Egypt Inflation Calculator.
// Sources (publicly available):
//   - Egypt CPI & inflation: IMF WEO, World Bank, CAPMAS.
//   - USD/EGP, EUR/EGP, GBP/EGP: IMF IFS, Central Bank of Egypt averages.
//   - SAR & AED are USD-pegged (SAR/USD ~3.75, AED/USD ~3.6725), derived from USD/EGP.
//   - Gold USD/troy oz: LBMA PM Fix annual average.
//   - BTC USD: CoinGecko / historical market averages.
//
// All figures are yearly averages unless noted. They're intended for
// educational comparison, not financial advice or real-time quotes.

export type Year = number;

export interface YearlySeries {
  [year: number]: number;
}

// Egypt CPI index, rebased so 1990 = 100. Built by compounding
// published annual inflation (YoY CPI change) figures.
export const EGYPT_CPI: YearlySeries = {
  1990: 100.0,
  1991: 119.7,
  1992: 135.98,
  1993: 152.43,
  1994: 164.93,
  1995: 190.82,
  1996: 204.56,
  1997: 213.97,
  1998: 222.10,
  1999: 228.98,
  2000: 235.17,
  2001: 240.57,
  2002: 247.07,
  2003: 258.19,
  2004: 287.37,
  2005: 301.45,
  2006: 324.36,
  2007: 354.53,
  2008: 419.42,
  2009: 468.91,
  2010: 521.90,
  2011: 574.61,
  2012: 615.41,
  2013: 673.87,
  2014: 742.13,
  2015: 819.31,
  2016: 932.37,
  2017: 1207.42,
  2018: 1381.29,
  2019: 1508.37,
  2020: 1583.79,
  2021: 1666.14,
  2022: 1897.73,
  2023: 2540.07,
  2024: 3259.9,
  2025: 3814.1,
  2026: 4271.7,
};

// USD/EGP yearly average exchange rates (1 USD = X EGP).
export const USD_EGP: YearlySeries = {
  1990: 2.03,
  1991: 3.14,
  1992: 3.33,
  1993: 3.35,
  1994: 3.39,
  1995: 3.39,
  1996: 3.39,
  1997: 3.39,
  1998: 3.39,
  1999: 3.40,
  2000: 3.47,
  2001: 3.97,
  2002: 4.50,
  2003: 5.85,
  2004: 6.20,
  2005: 5.78,
  2006: 5.73,
  2007: 5.64,
  2008: 5.43,
  2009: 5.55,
  2010: 5.62,
  2011: 5.93,
  2012: 6.06,
  2013: 6.87,
  2014: 7.08,
  2015: 7.69,
  2016: 10.03,
  2017: 17.78,
  2018: 17.77,
  2019: 16.77,
  2020: 15.76,
  2021: 15.64,
  2022: 19.16,
  2023: 30.63,
  2024: 47.87,
  2025: 50.10,
  2026: 48.50,
};

// EUR/EGP yearly average (EUR introduced 1999; earlier years derived via ECU).
export const EUR_EGP: YearlySeries = {
  1999: 3.62,
  2000: 3.20,
  2001: 3.56,
  2002: 4.25,
  2003: 6.61,
  2004: 7.71,
  2005: 7.20,
  2006: 7.19,
  2007: 7.72,
  2008: 7.99,
  2009: 7.73,
  2010: 7.45,
  2011: 8.25,
  2012: 7.79,
  2013: 9.13,
  2014: 9.41,
  2015: 8.54,
  2016: 11.09,
  2017: 20.07,
  2018: 20.99,
  2019: 18.77,
  2020: 17.99,
  2021: 18.49,
  2022: 20.17,
  2023: 33.10,
  2024: 51.80,
  2025: 54.20,
  2026: 52.50,
};

// GBP/EGP yearly average.
export const GBP_EGP: YearlySeries = {
  1990: 3.63,
  1995: 5.35,
  2000: 5.25,
  2001: 5.72,
  2002: 6.76,
  2003: 9.56,
  2004: 11.35,
  2005: 10.51,
  2006: 10.55,
  2007: 11.29,
  2008: 10.08,
  2009: 8.68,
  2010: 8.68,
  2011: 9.50,
  2012: 9.61,
  2013: 10.75,
  2014: 11.67,
  2015: 11.76,
  2016: 13.60,
  2017: 22.88,
  2018: 23.70,
  2019: 21.42,
  2020: 20.21,
  2021: 21.51,
  2022: 23.66,
  2023: 38.10,
  2024: 61.27,
  2025: 64.10,
  2026: 62.30,
};

// SAR is pegged to USD at ~3.75, so 1 SAR ≈ USD/EGP / 3.75 in EGP.
// AED is pegged to USD at ~3.6725, so 1 AED ≈ USD/EGP / 3.6725 in EGP.
// These are derived automatically from USD_EGP below.

// Gold USD per troy ounce (LBMA annual average).
export const GOLD_USD: YearlySeries = {
  1990: 383,
  1991: 362,
  1992: 344,
  1993: 360,
  1994: 384,
  1995: 384,
  1996: 388,
  1997: 331,
  1998: 294,
  1999: 279,
  2000: 279,
  2001: 271,
  2002: 310,
  2003: 363,
  2004: 409,
  2005: 445,
  2006: 603,
  2007: 695,
  2008: 872,
  2009: 972,
  2010: 1225,
  2011: 1572,
  2012: 1669,
  2013: 1411,
  2014: 1266,
  2015: 1160,
  2016: 1251,
  2017: 1257,
  2018: 1269,
  2019: 1393,
  2020: 1770,
  2021: 1799,
  2022: 1800,
  2023: 1943,
  2024: 2388,
  2025: 2760,
  2026: 3100,
};

// BTC USD yearly average (BTC effectively did not exist before 2010).
export const BTC_USD: YearlySeries = {
  2010: 0.10,
  2011: 5.0,
  2012: 8.3,
  2013: 208,
  2014: 528,
  2015: 272,
  2016: 568,
  2017: 4001,
  2018: 7569,
  2019: 7358,
  2020: 11111,
  2021: 47686,
  2022: 28199,
  2023: 28849,
  2024: 65950,
  2025: 98000,
  2026: 103000,
};

export const CURRENT_YEAR = 2026;
export const EARLIEST_YEAR = 1990;
export const EARLIEST_BTC_YEAR = 2010;

export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)", symbol: "$" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€" },
  { code: "GBP", label: "British Pound (GBP)", symbol: "£" },
  { code: "SAR", label: "Saudi Riyal (SAR)", symbol: "﷼" },
  { code: "AED", label: "UAE Dirham (AED)", symbol: "د.إ" },
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"];

// Returns EGP per 1 unit of the given foreign currency for the given year.
export function getFxRate(code: CurrencyCode, year: Year): number | null {
  switch (code) {
    case "USD":
      return USD_EGP[year] ?? null;
    case "EUR":
      return EUR_EGP[year] ?? null;
    case "GBP":
      return GBP_EGP[year] ?? null;
    case "SAR": {
      const usd = USD_EGP[year];
      return usd == null ? null : usd / 3.75;
    }
    case "AED": {
      const usd = USD_EGP[year];
      return usd == null ? null : usd / 3.6725;
    }
    default:
      return null;
  }
}
// Add to existing file
export const FORECAST_ASSUMPTIONS = {
  inflation: 0.25,      // 25% annual inflation forecast
  goldUSD: 0.08,        // 8% annual gold price appreciation
  bitcoin: 0.15,        // 15% annual BTC appreciation (conservative)
  egpDevaluation: 0.20  // 20% annual EGP/USD depreciation
};

export function getProjectedCPI(targetYear: number, baseCpi: number, baseYear: number): number {
  const yearsDiff = targetYear - baseYear;
  if (yearsDiff <= 0) return baseCpi;
  
  // Compound inflation forecast
  return baseCpi * Math.pow(1 + FORECAST_ASSUMPTIONS.inflation, yearsDiff);
}

export function getProjectedGoldPrice(targetYear: number, currentGoldUsd: number, currentYear: number): number {
  const yearsDiff = targetYear - currentYear;
  if (yearsDiff <= 0) return currentGoldUsd;
  return currentGoldUsd * Math.pow(1 + FORECAST_ASSUMPTIONS.goldUSD, yearsDiff);
}

export function getProjectedBTCPrice(targetYear: number, currentBtcUsd: number, currentYear: number): number {
  const yearsDiff = targetYear - currentYear;
  if (yearsDiff <= 0) return currentBtcUsd;
  return currentBtcUsd * Math.pow(1 + FORECAST_ASSUMPTIONS.bitcoin, yearsDiff);
}

export function getProjectedFXRate(targetYear: number, currentRate: number, currentYear: number): number {
  const yearsDiff = targetYear - currentYear;
  if (yearsDiff <= 0) return currentRate;
  return currentRate * Math.pow(1 + FORECAST_ASSUMPTIONS.egpDevaluation, yearsDiff);
}
