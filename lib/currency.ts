export type CurrencyCode = string;

export type CurrencyDefinition = {
  code: CurrencyCode;
  name: string;
  symbol?: string;
};

export type FxRates = Record<CurrencyCode, number>;

export const DEFAULT_CURRENCY = "USD";
export const CURRENCY_STORAGE_KEY = "sekur-currency";

export const PRIORITY_CURRENCIES = [
  "USD",
  "SEK",
  "INR",
  "EUR",
  "GBP",
  "NOK",
  "DKK",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "JPY",
  "SGD",
  "KRW",
  "PLN",
  "RON",
  "HUF",
  "BRL",
  "MXN",
  "MYR",
];

const CURRENCY_LOCALES: Record<string, string> = {
  USD: "en-US",
  SEK: "sv-SE",
  INR: "en-IN",
  EUR: "de-DE",
  GBP: "en-GB",
  NOK: "nb-NO",
  DKK: "da-DK",
  CHF: "de-CH",
  CAD: "en-CA",
  AUD: "en-AU",
  NZD: "en-NZ",
  JPY: "ja-JP",
  SGD: "en-SG",
  KRW: "ko-KR",
  PLN: "pl-PL",
  RON: "ro-RO",
  HUF: "hu-HU",
  BRL: "pt-BR",
  MXN: "es-MX",
  MYR: "ms-MY",
};

export function convertCurrency(
  amount: number,
  sourceCurrency: CurrencyCode,
  targetCurrency: CurrencyCode,
  rates: FxRates
) {
  if (!Number.isFinite(amount)) {
    return amount;
  }

  if (sourceCurrency === targetCurrency) {
    return amount;
  }

  const sourceRate =
    sourceCurrency === DEFAULT_CURRENCY
      ? 1
      : rates[sourceCurrency];

  const targetRate =
    targetCurrency === DEFAULT_CURRENCY
      ? 1
      : rates[targetCurrency];

  if (!sourceRate || !targetRate) {
    return amount;
  }

  const amountInUsd = amount / sourceRate;
  return amountInUsd * targetRate;
}

function localeFor(currency: CurrencyCode) {
  return CURRENCY_LOCALES[currency] ?? "en-US";
}

function fractionDigitsFor(
  currency: CurrencyCode,
  requested?: number
) {
  if (requested !== undefined) {
    return requested;
  }

  if (currency === "JPY" || currency === "KRW") {
    return 0;
  }

  return 0;
}

function compactFractionDigits(value: number) {
  if (value < 10) {
    return 2;
  }

  if (value < 100) {
    return 1;
  }

  return 0;
}

function compactNumber(
  value: number,
  locale: string,
  requestedDigits?: number
) {
  const digits =
    requestedDigits ??
    compactFractionDigits(
      Math.abs(value)
    );

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

function currencyAffixes(
  currency: CurrencyCode
) {
  const locale =
    localeFor(currency);

  const parts =
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(1);

  const currencyIndex =
    parts.findIndex(
      (part) =>
        part.type === "currency"
    );

  const integerIndex =
    parts.findIndex(
      (part) =>
        part.type === "integer"
    );

  const symbol =
    parts.find(
      (part) =>
        part.type === "currency"
    )?.value ?? currency;

  return {
    symbol,
    before:
      currencyIndex >= 0 &&
      integerIndex >= 0 &&
      currencyIndex < integerIndex,
  };
}

function formatStandardCurrency(
  amount: number,
  currency: CurrencyCode,
  maximumFractionDigits?: number
) {
  return new Intl.NumberFormat(
    localeFor(currency),
    {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits:
        fractionDigitsFor(
          currency,
          maximumFractionDigits
        ),
    }
  ).format(amount);
}

function formatIndianCurrency(
  amount: number,
  compact: boolean,
  maximumFractionDigits?: number
) {
  if (!compact) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        currencyDisplay:
          "narrowSymbol",
        minimumFractionDigits: 0,
        maximumFractionDigits:
          maximumFractionDigits ??
          0,
      }
    ).format(amount);
  }

  const absolute =
    Math.abs(amount);

  const sign =
    amount < 0 ? "-" : "";

  // Keep the source file ASCII-only so Windows/PowerShell
  // cannot corrupt the rupee symbol during file writes.
  const rupee = "\u20B9";

  if (
    absolute >=
    1_00_00_000
  ) {
    const value =
      absolute /
      1_00_00_000;

    return `${sign}${rupee}${compactNumber(
      value,
      "en-IN",
      maximumFractionDigits
    )} crore`;
  }

  if (
    absolute >=
    1_00_000
  ) {
    const value =
      absolute /
      1_00_000;

    return `${sign}${rupee}${compactNumber(
      value,
      "en-IN",
      maximumFractionDigits
    )} lakh`;
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      currencyDisplay:
        "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits:
        maximumFractionDigits ??
        0,
    }
  ).format(amount);
}

function formatCompactCurrency(
  amount: number,
  currency: CurrencyCode,
  maximumFractionDigits?: number
) {
  if (currency === "INR") {
    return formatIndianCurrency(
      amount,
      true,
      maximumFractionDigits
    );
  }

  const absolute =
    Math.abs(amount);

  if (absolute < 1_000) {
    return formatStandardCurrency(
      amount,
      currency,
      maximumFractionDigits
    );
  }

  let divisor = 1;
  let suffix = "";

  if (
    absolute >=
    1_000_000_000
  ) {
    divisor =
      1_000_000_000;
    suffix = "B";
  } else if (
    absolute >=
    1_000_000
  ) {
    divisor =
      1_000_000;
    suffix = "M";
  } else {
    divisor = 1_000;
    suffix = "K";
  }

  const value =
    absolute / divisor;

  const number =
    compactNumber(
      value,
      localeFor(currency),
      maximumFractionDigits
    );

  const {
    symbol,
    before,
  } =
    currencyAffixes(currency);

  const sign =
    amount < 0 ? "-" : "";

  if (before) {
    return `${sign}${symbol}${number}${suffix}`;
  }

  return `${sign}${number}${suffix} ${symbol}`;
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  options?: {
    compact?: boolean;
    maximumFractionDigits?: number;
  }
) {
  if (!Number.isFinite(amount)) {
    return "";
  }

  const compact =
    options?.compact ??
    false;

  if (currency === "INR") {
    return formatIndianCurrency(
      amount,
      compact,
      options?.maximumFractionDigits
    );
  }

  if (compact) {
    return formatCompactCurrency(
      amount,
      currency,
      options?.maximumFractionDigits
    );
  }

  return formatStandardCurrency(
    amount,
    currency,
    options?.maximumFractionDigits
  );
}
