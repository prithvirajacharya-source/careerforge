import { NextResponse } from "next/server";
import {
  DEFAULT_CURRENCY,
  PRIORITY_CURRENCIES,
} from "@/lib/currency";

export const revalidate = 21600;

type FrankfurterRate = {
  date?: string;
  base?: string;
  quote?: string;
  rate?: number;
};

type FrankfurterCurrency = {
  iso_code?: string;
  name?: string;
  symbol?: string;
};

export async function GET() {
  try {
    const [ratesResponse, currenciesResponse] = await Promise.all([
      fetch(
        `https://api.frankfurter.dev/v2/rates?base=${DEFAULT_CURRENCY}`,
        { next: { revalidate } }
      ),
      fetch("https://api.frankfurter.dev/v2/currencies", {
        next: { revalidate },
      }),
    ]);

    if (!ratesResponse.ok || !currenciesResponse.ok) {
      throw new Error("FX provider request failed.");
    }

    const rateRows =
      (await ratesResponse.json()) as FrankfurterRate[];

    const currencyRows =
      (await currenciesResponse.json()) as FrankfurterCurrency[];

    const rates: Record<string, number> = {
      [DEFAULT_CURRENCY]: 1,
    };

    let date = "";

    for (const row of rateRows) {
      if (
        row.quote &&
        typeof row.rate === "number" &&
        Number.isFinite(row.rate)
      ) {
        rates[row.quote] = row.rate;
      }

      if (!date && row.date) {
        date = row.date;
      }
    }

    const priority = new Map(
      PRIORITY_CURRENCIES.map((code, index) => [code, index])
    );

    const currencies = currencyRows
      .filter(
        (row) =>
          row.iso_code &&
          Boolean(rates[row.iso_code])
      )
      .map((row) => ({
        code: row.iso_code as string,
        name: row.name ?? (row.iso_code as string),
        symbol: row.symbol ?? undefined,
      }))
      .sort((left, right) => {
        const leftPriority = priority.get(left.code);
        const rightPriority = priority.get(right.code);

        if (leftPriority !== undefined || rightPriority !== undefined) {
          return (
            (leftPriority ?? Number.MAX_SAFE_INTEGER) -
            (rightPriority ?? Number.MAX_SAFE_INTEGER)
          );
        }

        return left.code.localeCompare(right.code);
      });

    if (!currencies.some((currency) => currency.code === DEFAULT_CURRENCY)) {
      currencies.unshift({
        code: DEFAULT_CURRENCY,
        name: "US Dollar",
        symbol: "$",
      });
    }

    return NextResponse.json({
      base: DEFAULT_CURRENCY,
      date,
      rates,
      currencies,
    });
  } catch (error) {
    console.error("SEKUR FX route failed:", error);

    return NextResponse.json(
      {
        base: DEFAULT_CURRENCY,
        date: null,
        rates: {
          [DEFAULT_CURRENCY]: 1,
        },
        currencies: [
          {
            code: DEFAULT_CURRENCY,
            name: "US Dollar",
            symbol: "$",
          },
        ],
        error: "Live exchange rates are temporarily unavailable.",
      },
      { status: 200 }
    );
  }
}
