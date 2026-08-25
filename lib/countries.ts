import { supabase } from "./supabase";
import { COUNTRY_CATALOG, type CountryCatalogEntry } from "./countryCatalog";

export async function getCountries(): Promise<CountryCatalogEntry[]> {
  let data: Array<Partial<CountryCatalogEntry> & { slug?: string }> | null = null;
  let error: unknown = null;
  try {
    const result = await supabase.from("countries").select("*").order("name", { ascending: true });
    data = result.data;
    error = result.error;
  } catch (caught) {
    error = caught;
  }

  if (error) {
    console.error("Error loading countries:", error);
    return COUNTRY_CATALOG;
  }

  const rows = new Map((data ?? []).flatMap((row) => row.slug ? [[row.slug, row]] : []));
  return COUNTRY_CATALOG.map((entry) => ({ ...rows.get(entry.slug), ...entry }));
}
