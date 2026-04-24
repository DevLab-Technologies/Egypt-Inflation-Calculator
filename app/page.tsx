'use client';

import { useState } from 'react';
import { calculateFutureValue, ForecastResult } from '@/lib/calculate';
import { getCPI, getGoldPrice, getBTCPrice, getFXRate, CURRENT_YEAR } from '@/lib/historical-data';

export default function Home() {
  const [amount, setAmount] = useState('1000');
  const [fromYear, setFromYear] = useState('2020');
  const [toYear, setToYear] = useState(CURRENT_YEAR.toString());
  const [results, setResults] = useState<ForecastResult[]>([]);
  const [showForecast, setShowForecast] = useState(true);

  const currentCpi = getCPI(CURRENT_YEAR);
  const currentGold = getGoldPrice(CURRENT_YEAR);
  const currentBtc = getBTCPrice(CURRENT_YEAR);
  const currentFx = getFXRate(CURRENT_YEAR);

  const handleCalculate = () => {
    const numAmount = parseFloat(amount);
    const numFromYear = parseInt(fromYear);
    const numToYear = parseInt(toYear);
    
    if (isNaN(numAmount) || isNaN(numFromYear) || isNaN(numToYear)) return;
    
    const forecastResults: ForecastResult[] = [];
    
    // Calculate for each year from fromYear to toYear
    for (let year = numFromYear; year <= numToYear; year++) {
      const result = calculateFutureValue(
        numAmount,
        numFromYear,
        year,
        currentCpi,
        currentGold,
        currentBtc,
        currentFx,
        CURRENT_YEAR
      );
      forecastResults.push(result);
    }
    
    setResults(forecastResults);
  };

  const formatEGP = (value: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(value);
  };

  const years = Array.from({ length: CURRENT_YEAR - 2000 + 10 }, (_, i) => (2000 + i).toString());

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-800">
          Egypt Inflation Calculator
        </h1>
        <p className="text-center text-slate-600 mb-8">
          What's your money worth now — and in the future?
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount (EGP)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Year
              </label>
              <select
                value={fromYear}
                onChange={(e) => setFromYear(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To Year {showForecast && '(Past or Future)'}
              </label>
              <input
                type="number"
                value={toYear}
                onChange={(e) => setToYear(e.target.value)}
                min="2000"
                max={CURRENT_YEAR + 10}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleCalculate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Calculate
            </button>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showForecast}
                onChange={(e) => setShowForecast(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-600">Enable future forecasting</span>
            </label>
          </div>
        </div>

        {results.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Year</th>
                  <th className="px-6 py-3 text-left">Inflation-Adjusted</th>
                  <th className="px-6 py-3 text-left">Gold Strategy</th>
                  <th className="px-6 py-3 text-left">Bitcoin Strategy</th>
                  <th className="px-6 py-3 text-left">Raw Inflation (EGP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((result, idx) => {
                  const isForecast = result.year > CURRENT_YEAR;
                  return (
                    <tr key={idx} className={isForecast ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                      <td className="px-6 py-4 font-medium">
                        {result.year}
                        {isForecast && (
                          <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                            Forecast
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">{formatEGP(result.inflationAdjusted)}</td>
                      <td className="px-6 py-4">{formatEGP(result.goldAdjusted)}</td>
                      <td className="px-6 py-4">
                        {result.bitcoinAdjusted ? formatEGP(result.bitcoinAdjusted) : 'N/A (pre-2010)'}
                      </td>
                      <td className="px-6 py-4">{formatEGP(result.egpInflationOnly)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="mt-4 p-4 bg-amber-50 rounded-lg text-sm text-amber-800">
              <strong>📈 Forecast Notes:</strong> Future projections assume:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>25% annual inflation</li>
                <li>8% annual gold appreciation (USD)</li>
                <li>15% annual Bitcoin appreciation (conservative)</li>
                <li>20% annual EGP devaluation against USD</li>
                <li className="text-xs mt-2 text-amber-600">
                  ⚠️ These are illustrative assumptions only — not financial advice.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
                                                 }  yearLabel: string;
  currencyLabel: string;
  currencyName: Record<CurrencyCode, string>;
  emptyState: string;
  summaryYouHad: string;
  summaryIn: string;
  summaryToMatch: string;
  summaryDetail: (
    mult: string,
    years: number,
    yearsLabel: string,
    inflation: string
  ) => string;
  summaryYear: (n: number) => string;
  cardGold: string;
  cardBitcoin: string;
  cardSavingsAs: (code: string) => string;
  worthToday: string;
  gainLoss: string;
  annualised: string;
  multiplier: string;
  vsInflation: string;
  holdingLabel: (amount: string, unit: HoldingUnit) => string;
  btcNotExist: (year: number) => string;
  noFxRate: string;
  disclaimer: string;
  switchToEnglish: string;
  switchToArabic: string;
  sponsoredBy: string;
  allRightsReserved: string;
};

const DICT: Record<Language, Dict> = {
  ar: {
    title: "حاسبة التضخم في مصر",
    subtitle:
      "اكتشف كم تساوي جنيهاتك المصرية اليوم — بعد حساب التضخم، أو لو استثمرتها في الذهب، أو البيتكوين، أو ادخرتها بعملة أجنبية.",
    amountLabel: "المبلغ (جنيه مصري)",
    yearLabel: "السنة",
    currencyLabel: "عملة الادخار",
    currencyName: {
      USD: "دولار أمريكي (USD)",
      EUR: "يورو (EUR)",
      GBP: "جنيه إسترليني (GBP)",
      SAR: "ريال سعودي (SAR)",
      AED: "درهم إماراتي (AED)",
    },
    emptyState: "أدخل مبلغًا لعرض النتائج.",
    summaryYouHad: "كان لديك",
    summaryIn: "في",
    summaryToMatch: "لنفس القوة الشرائية اليوم، تحتاج إلى",
    summaryDetail: (mult, years, yearsLabel, infl) =>
      `${mult} خلال ${years} ${yearsLabel} (متوسط تضخم ${infl}/سنويًا)`,
    summaryYear: (n) => (n === 1 ? "سنة" : n === 2 ? "سنتين" : "سنة"),
    cardGold: "لو استثمرتها في الذهب",
    cardBitcoin: "لو استثمرتها في البيتكوين",
    cardSavingsAs: (code) => `لو ادخرتها بعملة ${code}`,
    worthToday: "قيمتها اليوم",
    gainLoss: "الربح / الخسارة",
    annualised: "العائد السنوي",
    multiplier: "المضاعف",
    vsInflation: "مقابل التضخم",
    holdingLabel: (amount, unit) => {
      if (unit === "oz") return `${amount} أونصة ذهب`;
      if (unit === "BTC") return `${amount} بيتكوين`;
      return `${amount} ${unit}`;
    },
    btcNotExist: (year) => `البيتكوين لم يكن موجودًا في عام ${year}.`,
    noFxRate: "لا تتوفر بيانات صرف لهذه العملة في هذا العام.",
    disclaimer:
      "تعتمد الحسابات على متوسطات سنوية لمؤشر أسعار المستهلك وأسعار الصرف والذهب (LBMA) والبيتكوين. الأرقام تقريبية للمقارنة فقط وليست أسعارًا فعلية. تفترض السيناريوهات شراءً لمرة واحدة بدون رسوم، ويفترض الادخار بعملة أجنبية الاحتفاظ بالنقد بدون فوائد.",
    switchToEnglish: "English",
    switchToArabic: "العربية",
    sponsoredBy: "برعاية",
    allRightsReserved: "جميع الحقوق محفوظة",
  },
  en: {
    title: "Egypt Inflation Calculator",
    subtitle:
      "See what your Egyptian pounds would be worth today — adjusted for inflation, or invested in gold, Bitcoin, or saved in a foreign currency.",
    amountLabel: "Amount (EGP)",
    yearLabel: "Year",
    currencyLabel: "Savings currency",
    currencyName: {
      USD: "US Dollar (USD)",
      EUR: "Euro (EUR)",
      GBP: "British Pound (GBP)",
      SAR: "Saudi Riyal (SAR)",
      AED: "UAE Dirham (AED)",
    },
    emptyState: "Enter an amount above to see the results.",
    summaryYouHad: "You had",
    summaryIn: "in",
    summaryToMatch: "To match buying power today, you'd need",
    summaryDetail: (mult, years, yearsLabel, infl) =>
      `${mult} over ${years} ${yearsLabel} (${infl}/yr avg inflation)`,
    summaryYear: (n) => (n === 1 ? "year" : "years"),
    cardGold: "If invested in Gold",
    cardBitcoin: "If invested in Bitcoin",
    cardSavingsAs: (code) => `If saved as ${code}`,
    worthToday: "Worth today",
    gainLoss: "Gain / loss",
    annualised: "Annualised",
    multiplier: "Multiplier",
    vsInflation: "vs. inflation",
    holdingLabel: (amount, unit) => {
      if (unit === "oz") return `${amount} oz held`;
      if (unit === "BTC") return `${amount} BTC held`;
      return `${amount} ${unit} held`;
    },
    btcNotExist: (year) => `Bitcoin didn't exist in ${year}.`,
    noFxRate: "No exchange-rate data available for this year.",
    disclaimer:
      "Calculations use annual-average data for CPI, FX rates, gold (LBMA) and Bitcoin. Figures are rounded and approximate — useful for comparison, not a live financial quote. Gold and Bitcoin scenarios assume a one-time buy-and-hold with no fees. Foreign-currency savings assume cash held with no interest.",
    switchToEnglish: "English",
    switchToArabic: "العربية",
    sponsoredBy: "Sponsored by",
    allRightsReserved: "All rights reserved",
  },
};

export default function Home() {
  const [lang, setLang] = useState<Language>(DEFAULT_LANG);
  const [amountInput, setAmountInput] = useState<string>(
    DEFAULT_AMOUNT.toString()
  );
  const [year, setYear] = useState<number>(DEFAULT_YEAR);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "ar" || stored === "en") {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const t = DICT[lang];

  const amount = useMemo(() => {
    const parsed = parseFloat(amountInput.replace(/,/g, ""));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [amountInput]);

  const result = useMemo(() => {
    if (amount <= 0) return null;
    return calculate({ amountEGP: amount, year, currency });
  }, [amount, year, currency]);

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-black">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-14">
        <Header lang={lang} t={t} onToggleLang={() => setLang(lang === "ar" ? "en" : "ar")} />

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <AmountField
              label={t.amountLabel}
              value={amountInput}
              onChange={setAmountInput}
            />
            <YearField
              label={t.yearLabel}
              value={year}
              onChange={setYear}
              lang={lang}
            />
            <CurrencyField
              label={t.currencyLabel}
              currencyName={t.currencyName}
              value={currency}
              onChange={setCurrency}
            />
          </div>
        </section>

        {result ? (
          <ResultsGrid result={result} lang={lang} t={t} />
        ) : (
          <EmptyState message={t.emptyState} />
        )}

        <Disclaimer text={t.disclaimer} />
        <CopyrightFooter t={t} />
      </div>
    </main>
  );
}

interface HeaderProps {
  lang: Language;
  t: Dict;
  onToggleLang: () => void;
}

function Header({ lang, t, onToggleLang }: HeaderProps) {
  const otherLabel = lang === "ar" ? t.switchToEnglish : t.switchToArabic;
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleLang}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-400"
          aria-label={otherLabel}
        >
          <GlobeIcon />
          <span lang={lang === "ar" ? "en" : "ar"}>{otherLabel}</span>
        </button>
      </div>
    </header>
  );
}

function LogoIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 4 4 5-5" />
      </svg>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  );
}

const FIELD_BASE =
  "h-11 w-full rounded-lg border border-slate-300 bg-white text-base text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50";

interface AmountFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function AmountField({ label, value, onChange }: AmountFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
          EGP
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="1000"
          className={`${FIELD_BASE} ps-14 pe-3 placeholder:text-slate-400`}
        />
      </div>
    </label>
  );
}

interface YearFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  lang: Language;
}

function YearField({ label, value, onChange }: YearFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className={`${FIELD_BASE} ps-3 pe-3`}
      >
        {YEARS.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}

interface CurrencyFieldProps {
  label: string;
  currencyName: Record<CurrencyCode, string>;
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
}

function CurrencyField({
  label,
  currencyName,
  value,
  onChange,
}: CurrencyFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className={`${FIELD_BASE} ps-3 pe-3`}
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {currencyName[c.code]}
          </option>
        ))}
      </select>
    </label>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
      {children}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {message}
    </section>
  );
}

interface ResultsGridProps {
  result: ReturnType<typeof calculate>;
  lang: Language;
  t: Dict;
}

function ResultsGrid({ result, lang, t }: ResultsGridProps) {
  const { amountEGP, year, yearsElapsed, inflation, gold, bitcoin, foreign } =
    result;

  const multStr = formatMultiplier(inflation.multiplier, lang);
  const yearsLabel = t.summaryYear(yearsElapsed);
  const inflPct = formatPercent(inflation.cagr, lang);

  return (
    <>
      <section className="mt-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-7 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {t.summaryYouHad}
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-50">
              {formatEGP(amountEGP, lang)}{" "}
              <span className="text-lg font-normal text-slate-600 dark:text-slate-400">
                {t.summaryIn} {year}
              </span>
            </div>
          </div>
          <div className="sm:text-end">
            <div className="text-xs font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
              {t.summaryToMatch}
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-50">
              {formatEGP(inflation.valueEGP, lang)}
            </div>
            <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              {t.summaryDetail(multStr, yearsElapsed, yearsLabel, inflPct)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ResultCard
          title={t.cardGold}
          icon={<GoldIcon />}
          tone="amber"
          scenario={gold}
          amountEGP={amountEGP}
          lang={lang}
          t={t}
        />
        <ResultCard
          title={t.cardBitcoin}
          icon={<BitcoinIcon />}
          tone="orange"
          scenario={bitcoin}
          amountEGP={amountEGP}
          lang={lang}
          t={t}
          unavailableNote={
            year < EARLIEST_BTC_YEAR ? t.btcNotExist(year) : undefined
          }
        />
        <ResultCard
          title={t.cardSavingsAs(result.currency)}
          icon={<CurrencyIcon />}
          tone="emerald"
          scenario={foreign}
          amountEGP={amountEGP}
          lang={lang}
          t={t}
          unavailableNote={foreign.unavailable ? t.noFxRate : undefined}
        />
      </section>
    </>
  );
}

type Tone = "amber" | "orange" | "emerald";

const TONE_STYLES: Record<
  Tone,
  { border: string; accent: string; pill: string }
> = {
  amber: {
    border: "border-amber-200 dark:border-amber-900/40",
    accent: "text-amber-600 dark:text-amber-400",
    pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  orange: {
    border: "border-orange-200 dark:border-orange-900/40",
    accent: "text-orange-600 dark:text-orange-400",
    pill: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-900/40",
    accent: "text-emerald-600 dark:text-emerald-400",
    pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
};

interface ResultCardProps {
  title: string;
  icon: React.ReactNode;
  tone: Tone;
  scenario: ScenarioResult;
  amountEGP: number;
  lang: Language;
  t: Dict;
  unavailableNote?: string;
}

function ResultCard({
  title,
  icon,
  tone,
  scenario,
  amountEGP,
  lang,
  t,
  unavailableNote,
}: ResultCardProps) {
  const styles = TONE_STYLES[tone];

  if (unavailableNote || scenario.unavailable) {
    return (
      <article
        className={`rounded-2xl border ${styles.border} bg-white p-5 shadow-sm dark:bg-slate-900`}
      >
        <CardHeader title={title} icon={icon} accent={styles.accent} />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {unavailableNote ?? t.noFxRate}
        </p>
      </article>
    );
  }

  const gainLoss = scenario.valueEGP - amountEGP;
  const gainColor =
    gainLoss >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  const realColor =
    scenario.realMultiplier >= 1
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  const holdingText = scenario.holdings
    ? t.holdingLabel(
        formatNumber(
          scenario.holdings.amount,
          lang,
          scenario.holdings.amount < 1 ? 4 : 2
        ),
        scenario.holdings.unit
      )
    : null;

  return (
    <article
      className={`rounded-2xl border ${styles.border} bg-white p-5 shadow-sm dark:bg-slate-900`}
    >
      <CardHeader title={title} icon={icon} accent={styles.accent} />

      <div className="mt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
          {t.worthToday}
        </div>
        <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {formatEGP(scenario.valueEGP, lang)}
        </div>
        {holdingText ? (
          <div
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles.pill}`}
          >
            {holdingText}
          </div>
        ) : null}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t.gainLoss}
          </dt>
          <dd className={`mt-0.5 font-semibold ${gainColor}`}>
            {gainLoss >= 0 ? "+" : ""}
            {formatEGP(gainLoss, lang)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t.annualised}
          </dt>
          <dd className={`mt-0.5 font-semibold ${gainColor}`}>
            {formatPercent(scenario.cagr, lang)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t.multiplier}
          </dt>
          <dd className="mt-0.5 font-semibold text-slate-900 dark:text-slate-100">
            {formatMultiplier(scenario.multiplier, lang)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            {t.vsInflation}
          </dt>
          <dd className={`mt-0.5 font-semibold ${realColor}`}>
            {formatMultiplier(scenario.realMultiplier, lang)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

interface CardHeaderProps {
  title: string;
  icon: React.ReactNode;
  accent: string;
}

function CardHeader({ title, icon, accent }: CardHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={accent}>{icon}</span>
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
        {title}
      </h2>
    </div>
  );
}

function GoldIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10" />
      <path d="M9.5 9h3.5a1.5 1.5 0 010 3H9.5m0 0h4a1.5 1.5 0 010 3H9.5" />
    </svg>
  );
}

function BitcoinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 7v10M11 7v10M9 9h4.5a2 2 0 010 4H9m0 0h5a2 2 0 010 4H9" />
      <path d="M11 5v2M13 5v2M11 17v2M13 17v2" />
    </svg>
  );
}

function CurrencyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 10v.01M6 14v.01M18 10v.01M18 14v.01" />
    </svg>
  );
}

function Disclaimer({ text }: { text: string }) {
  return (
    <section className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
      <p>{text}</p>
    </section>
  );
}

interface CopyrightFooterProps {
  t: Dict;
}

function CopyrightFooter({ t }: CopyrightFooterProps) {
  return (
    <footer className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3">
        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
          <bdi>©</bdi>{" "}
          <bdi>{CURRENT_YEAR}</bdi>{" "}
          <bdi>
            <a
              href="https://elkhayyat.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-900 hover:text-amber-600 dark:text-slate-100 dark:hover:text-amber-400"
            >
              AHMED ELKHAYYAT
            </a>
          </bdi>
          <span className="mx-2 text-slate-400 dark:text-slate-600">·</span>
          <bdi>{t.allRightsReserved}</bdi>
        </p>
        <div className="flex items-center gap-3">
          <SocialLink
            href="https://elkhayyat.me"
            label="Website"
            icon={<LinkIcon />}
          />
          <SocialLink
            href="https://x.com/AHMEDELKHAYYAT"
            label="X"
            icon={<XIcon />}
          />
          <SocialLink
            href="https://linkedin.com/in/elkhayyat"
            label="LinkedIn"
            icon={<LinkedInIcon />}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500 dark:text-slate-500">
          {t.sponsoredBy}
        </span>
        <a
          href="https://devlabtechnologies.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <SparkleIcon />
          DevLab Technologies LLC
        </a>
      </div>
    </footer>
  );
}

interface SocialLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function SocialLink({ href, label, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-400 dark:hover:text-amber-400"
    >
      {icon}
    </a>
  );
}

function LinkIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
      <path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M18.244 2h3.308l-7.227 8.26L22.88 22h-6.65l-5.214-6.815L4.8 22H1.49l7.73-8.835L1.12 2h6.826l4.713 6.23L18.244 2zm-1.161 18.05h1.833L7.03 3.86H5.063l12.02 16.19z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zM8.34 18.34v-7.98H5.67v7.98h2.67zM7 9.17a1.55 1.55 0 100-3.1 1.55 1.55 0 000 3.1zm11.34 9.17v-4.37c0-2.34-1.25-3.43-2.92-3.43-1.34 0-1.94.74-2.27 1.26v-1.08h-2.67c.04.75 0 7.98 0 7.98h2.67v-4.46c0-.24.02-.48.09-.65.19-.48.63-.97 1.37-.97.97 0 1.35.74 1.35 1.82v4.26h2.38z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z" />
    </svg>
  );
}
