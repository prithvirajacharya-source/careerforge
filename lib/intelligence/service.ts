import { supabase } from "@/lib/supabase";
import {
  calculateIntelligenceScore,
  IntelligenceFactor,
  IntelligenceResult,
} from "./score";

export type CountryIntelligenceRow = {
  id: number;
  country_slug: string;
  factor_key: string;
  factor_label: string;
  score: number;
  weight: number;
  source_type:
    | "official"
    | "market"
    | "community"
    | "research"
    | "estimated";
  source_name: string | null;
  source_url: string | null;
  explanation: string | null;
  verified_at: string | null;
  updated_at: string | null;
};

export type CountryIntelligenceData = {
  slug: string;
  result: IntelligenceResult;
  rows: CountryIntelligenceRow[];
};

function rowToFactor(
  row: CountryIntelligenceRow
): IntelligenceFactor {
  return {
    key: row.factor_key,
    label: row.factor_label,
    score: row.score,
    weight: row.weight,
    sourceType: row.source_type,
    explanation: row.explanation ?? undefined,
  };
}

export async function getCountryIntelligence(
  countrySlug: string
): Promise<CountryIntelligenceData | null> {
  const { data, error } = await supabase
    .from("country_intelligence_factors")
    .select("*")
    .eq("country_slug", countrySlug)
    .order("id", { ascending: true });

  if (error) {
    console.error(
      "Failed to load country intelligence:",
      error
    );

    return null;
  }

  const rows =
    (data as CountryIntelligenceRow[]) ?? [];

  if (rows.length === 0) {
    return null;
  }

  const factors =
    rows.map(rowToFactor);

  const result =
    calculateIntelligenceScore(factors);

  return {
    slug: countrySlug,
    result,
    rows,
  };
}

export async function getAllCountryIntelligence() {
  const { data, error } = await supabase
    .from("country_intelligence_factors")
    .select("*")
    .order("country_slug", {
      ascending: true,
    })
    .order("id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Failed to load all intelligence:",
      error
    );

    return {};
  }

  const rows =
    (data as CountryIntelligenceRow[]) ?? [];

  const grouped: Record<
    string,
    CountryIntelligenceRow[]
  > = {};

  for (const row of rows) {
    if (!grouped[row.country_slug]) {
      grouped[row.country_slug] = [];
    }

    grouped[row.country_slug].push(row);
  }

  const result: Record<
    string,
    CountryIntelligenceData
  > = {};

  for (const [
    slug,
    countryRows,
  ] of Object.entries(grouped)) {
    const factors =
      countryRows.map(rowToFactor);

    result[slug] = {
      slug,
      rows: countryRows,
      result:
        calculateIntelligenceScore(
          factors
        ),
    };
  }

  return result;
}