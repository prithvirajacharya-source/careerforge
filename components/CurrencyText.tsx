"use client";

import { Fragment } from "react";
import Money from "@/components/Money";

function parseUsdAmount(value: string) {
  const clean = value.trim().replace(/,/g, "");
  const match = clean.match(/^\$?([0-9]+(?:\.[0-9]+)?)([kKmM])?$/);

  if (!match) {
    return null;
  }

  const amount = Number(match[1]);
  const suffix = match[2]?.toLowerCase();

  if (!Number.isFinite(amount)) {
    return null;
  }

  if (suffix === "k") {
    return amount * 1_000;
  }

  if (suffix === "m") {
    return amount * 1_000_000;
  }

  return amount;
}

type ParsedMoneyText = {
  prefix: string;
  amount: number;
  suffix: string;
};

function parsePart(part: string): ParsedMoneyText | null {
  const trimmed = part.trim();
  const match = trimmed.match(/^(.*?)(\$[0-9][0-9.,]*(?:[kKmM])?)(.*)$/);

  if (!match) {
    return null;
  }

  const amount = parseUsdAmount(match[2]);

  if (amount === null) {
    return null;
  }

  return {
    prefix: match[1],
    amount,
    suffix: match[3],
  };
}

export default function CurrencyText({
  text,
}: {
  text: string;
}) {
  const parts = text.split(/(\s+[–—-]\s+)/);
  const parsed = parts.map((part, index) =>
    index % 2 === 0 ? parsePart(part) : null
  );

  if (!parsed.some(Boolean)) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        const money = parsed[index];

        if (!money) {
          return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
        }

        return (
          <Fragment key={`${part}-${index}`}>
            {money.prefix}
            <Money amount={money.amount} sourceCurrency="USD" compact />
            {money.suffix}
          </Fragment>
        );
      })}
    </>
  );
}
