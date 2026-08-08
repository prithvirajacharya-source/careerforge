import { supabase } from "./supabase";

export async function getCareers() {
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .order("career_score", { ascending: false });

  if (error) {
    console.error("Error loading careers:", error);
    return [];
  }

  return data ?? [];
}