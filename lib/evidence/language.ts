import type { EvidenceProvenance } from "./types.ts";

export type LanguageRequirementLevel = "legal" | "mandatory" | "preferred" | "market-expectation" | "recommendation";
export type LanguageEvidence = { primaryWorkplaceLanguage: string; usefulLanguages: string[]; englishOnlyRealistic: boolean | null; localLanguageImportance: "high" | "medium" | "low" | null; recommendedProficiency: string | null; requirementLevel: LanguageRequirementLevel; provenance: EvidenceProvenance };
export type LanguageFitResult = { score: number | null; matchedLanguages: string[]; missingLanguages: string[]; explanation: string };

const normalize = (value: string) => value.trim().toLowerCase();
export function calculateLanguageFit(userLanguages: string[], evidence: LanguageEvidence | null): LanguageFitResult {
  if (!evidence || evidence.provenance.status !== "published") return { score: null, matchedLanguages: [], missingLanguages: [], explanation: "Verified language evidence is unavailable." };
  const known = new Set(userLanguages.map(normalize)); const required = normalize(evidence.primaryWorkplaceLanguage); const matched = known.has(required);
  const isRequired = evidence.requirementLevel === "legal" || evidence.requirementLevel === "mandatory";
  const score = matched ? 100 : evidence.englishOnlyRealistic && known.has("english") ? 75 : isRequired ? 25 : evidence.localLanguageImportance === "high" ? 45 : 60;
  return { score, matchedLanguages: matched ? [evidence.primaryWorkplaceLanguage] : known.has("english") && evidence.englishOnlyRealistic ? ["English"] : [], missingLanguages: matched ? [] : [evidence.primaryWorkplaceLanguage], explanation: matched ? `Your profile includes ${evidence.primaryWorkplaceLanguage}.` : isRequired ? `${evidence.primaryWorkplaceLanguage} is supported as a required language by the published evidence.` : `${evidence.primaryWorkplaceLanguage} would improve access to this market.` };
}

export function extractJobLanguageRequirement(text: string | null): { language: string; mandatory: boolean; evidenceText: string } | null { if (!text) return null; const match = text.match(/(?:fluent|fluency|proficien(?:t|cy)|working knowledge)\s+(?:in|of)\s+(English|Swedish|German|French|Dutch|Danish|Finnish|Norwegian)|(?:English|Swedish|German|French|Dutch|Danish|Finnish|Norwegian)\s+(?:is\s+)?(?:required|mandatory|preferred)/i); if (!match) return null; const language = match[1] ?? match[0].match(/English|Swedish|German|French|Dutch|Danish|Finnish|Norwegian/i)?.[0]; if (!language) return null; return { language, mandatory: /required|mandatory|fluent|fluency|proficien/i.test(match[0]) && !/preferred/i.test(match[0]), evidenceText: match[0] }; }
