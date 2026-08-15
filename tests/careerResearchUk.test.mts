import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { strToU8, zipSync } from "fflate";
import { assertArchiveFileTypes, discoverOnsAsheRelease, inspectZipArchive, readXlsxSheet, selectUniqueArchiveEntry } from "../lib/careerResearch/bulkRelease.ts";
import { normalizeOnsAsheWorkbook, ONS_ASHE_DATASET_URL } from "../lib/careerResearch/ukAshe.ts";
import { CAREER_RESEARCH_TARGETS, getCareerResearchTarget } from "../lib/careerResearch/registry.ts";
import { validateCareerResearchPublication } from "../lib/careerResearch/publishing.ts";
import { nextExpectedRefresh, sourceHealthStatus } from "../lib/careerResearch/sourceHealth.ts";

type ProofRow = { description: string; code: string; median: number; p10: number | null; p90: number | null };
const proofRows = JSON.parse(readFileSync(new URL("./fixtures/ons-ashe-2025-proof.json", import.meta.url), "utf8")) as ProofRow[];
const releaseHtml = readFileSync(new URL("./fixtures/ons-ashe-2025-release.html", import.meta.url), "utf8");
const release = { year: "2025", downloadUrl: "https://www.ons.gov.uk/file?uri=%2Fashetable142025provisional.zip" };

function xml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function textCell(reference: string, value: string) { return `<c r="${reference}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`; }
function numberCell(reference: string, value: number) { return `<c r="${reference}"><v>${value}</v></c>`; }
function makeWorkbook(rows = proofRows, sheetName = "Full-Time") {
  const dataRows = rows.map((row, index) => {
    const number = index + 6;
    return `<row r="${number}">${textCell(`A${number}`, row.description)}${textCell(`B${number}`, row.code)}${numberCell(`D${number}`, row.median)}${row.p10 === null ? textCell(`H${number}`, "x") : numberCell(`H${number}`, row.p10)}${row.p90 === null ? textCell(`Q${number}`, "x") : numberCell(`Q${number}`, row.p90)}</row>`;
  }).join("");
  const worksheet = `<?xml version="1.0"?><worksheet><sheetData><row r="1">${textCell("A1", "Table 14.7a   Annual pay - Gross (£) - For full-time employee jobs: United Kingdom, 2025")}</row><row r="5">${textCell("A5", "Description")}${textCell("B5", "Code")}${textCell("D5", "Median")}${numberCell("H5", 10)}${numberCell("Q5", 90)}</row>${dataRows}</sheetData></worksheet>`;
  const workbook = `<?xml version="1.0"?><workbook xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const relationships = `<?xml version="1.0"?><Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>`;
  return zipSync({ "xl/workbook.xml": strToU8(workbook), "xl/_rels/workbook.xml.rels": strToU8(relationships), "xl/worksheets/sheet1.xml": strToU8(worksheet) });
}

test("ONS release discovery selects the current versioned official ZIP", () => {
  const found = discoverOnsAsheRelease(releaseHtml, ONS_ASHE_DATASET_URL);
  assert.equal(found.year, "2025");
  assert.equal(found.edition, "provisional");
  assert.equal(new URL(found.downloadUrl).hostname, "www.ons.gov.uk");
  assert.throws(() => discoverOnsAsheRelease("<html></html>", ONS_ASHE_DATASET_URL), /no versioned ZIP/);
});

test("bulk archive validation rejects traversal and ambiguous workbook selection", () => {
  assert.throws(() => inspectZipArchive(zipSync({ "../escape.xlsx": strToU8("unsafe") })), /Unsafe archive entry path/);
  const entries = inspectZipArchive(zipSync({ "release/a.xlsx": makeWorkbook(), "release/b.xlsx": makeWorkbook() }));
  assert.throws(() => selectUniqueArchiveEntry(entries, /\.xlsx$/), /exactly one/);
  assert.throws(() => assertArchiveFileTypes(inspectZipArchive(zipSync({ "release/run.exe": strToU8("unsafe") })), [".xlsx"]), /Unexpected archive file type/);
});

test("XLSX parsing fails closed on a changed sheet or malformed workbook", () => {
  assert.throws(() => readXlsxSheet(makeWorkbook(proofRows, "All"), "Full-Time"), /sheet Full-Time is missing/);
  assert.throws(() => readXlsxSheet(strToU8("not a workbook"), "Full-Time"), /Malformed XLSX|invalid zip/i);
});

test("all defensible UK mappings normalize annual GBP evidence with provenance", () => {
  const workbook = makeWorkbook();
  const targets = CAREER_RESEARCH_TARGETS.filter((target) => target.countrySlug === "united-kingdom");
  assert.equal(targets.length, 6);
  for (const target of targets) {
    const expected = proofRows.find((row) => row.code === target.occupationCode)!;
    const candidate = normalizeOnsAsheWorkbook(workbook, target, release, "2026-08-15T00:00:00Z");
    assert.deepEqual([candidate.salary.low.value, candidate.salary.typical.value, candidate.salary.high.value], [expected.p10, expected.median, expected.p90]);
    assert.equal(candidate.salary.sourceCurrency, "GBP");
    assert.equal(candidate.salary.period, "annual");
    assert.equal(candidate.salary.typical.provenance?.observationPeriod, "2025 provisional");
    assert.match(candidate.salary.typical.provenance?.geography ?? "", /United Kingdom.*full-time/);
    if (expected.p90 === null) assert.equal(candidate.salary.high.provenance, null);
  }
  assert.equal(getCareerResearchTarget("data-scientist", "united-kingdom"), null);
});

test("UK parser preserves unavailable cells and rejects missing, malformed, or unordered evidence", () => {
  const target = getCareerResearchTarget("mechanical-engineer", "united-kingdom")!;
  assert.equal(normalizeOnsAsheWorkbook(makeWorkbook(), target, release, "2026-08-15T00:00:00Z").salary.high.value, null);
  assert.throws(() => normalizeOnsAsheWorkbook(makeWorkbook(proofRows.filter((row) => row.code !== "2122")), target, release, "2026-08-15T00:00:00Z"), /missing SOC/);
  assert.throws(() => normalizeOnsAsheWorkbook(makeWorkbook([{ ...proofRows[0]!, p10: 60000 }]), target, release, "2026-08-15T00:00:00Z"), /cannot exceed/);
});

test("UK research remains review-first, source-health aware, and unpublishable", () => {
  const target = getCareerResearchTarget("mechanical-engineer", "united-kingdom")!;
  const candidate = normalizeOnsAsheWorkbook(makeWorkbook(), target, release, "2026-08-15T00:00:00Z");
  assert.throws(() => validateCareerResearchPublication({ id: 1, status: "approved", career_slug: target.careerSlug, country_slug: target.countrySlug, schema_version: "career-research-v1", candidate_profile: candidate }), /Publishing supports only/);
  assert.equal(sourceHealthStatus(0, candidate.researchedAt), "healthy");
  assert.equal(nextExpectedRefresh(candidate.researchedAt, 365), "2027-08-15T00:00:00.000Z");
});
