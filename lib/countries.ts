import { supabase } from "./supabase";

export async function getCountries() {
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error loading countries:", error);
    return [];
  }

  return data ?? [];
}