"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { formatCurrency } from "@/lib/currency";

type MoneyProps = {
  amount: number;
  sourceCurrency?: string;
  compact?: boolean;
  maximumFractionDigits?: number;
  className?: string;
};

export default function Money({
  amount,
  sourceCurrency = "USD",
  compact = false,
  maximumFractionDigits,
  className,
}: MoneyProps) {
  const {
    currency,
    convert,
    rates,
  } = useCurrency();

  const sourceAvailable =
    sourceCurrency === "USD" || Boolean(rates[sourceCurrency]);

  const targetAvailable =
    currency === "USD" || Boolean(rates[currency]);

  const canConvert = sourceAvailable && targetAvailable;

  const displayCurrency = canConvert ? currency : sourceCurrency;
  const displayAmount = canConvert
    ? convert(amount, sourceCurrency)
    : amount;

  return (
    <span className={className}>
      {formatCurrency(displayAmount, displayCurrency, {
        compact,
        maximumFractionDigits,
      })}
    </span>
  );
}
