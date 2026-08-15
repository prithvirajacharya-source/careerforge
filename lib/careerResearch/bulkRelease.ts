import { strFromU8, unzipSync } from "fflate";

export const MAX_RELEASE_ARCHIVE_BYTES = 25 * 1024 * 1024;
export const MAX_ARCHIVE_ENTRY_BYTES = 20 * 1024 * 1024;
export const MAX_ARCHIVE_TOTAL_BYTES = 50 * 1024 * 1024;

export type OfficialRelease = {
  year: string;
  edition: "provisional" | "revised";
  downloadUrl: string;
};

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));
}

function safeArchivePath(path: string) {
  const normalized = path.replace(/\\/g, "/");
  if (!normalized || normalized.startsWith("/") || /^[A-Za-z]:/.test(normalized) || normalized.split("/").includes("..")) {
    throw new Error(`Unsafe archive entry path: ${path || "(empty)"}.`);
  }
  return normalized;
}

export function inspectZipArchive(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_RELEASE_ARCHIVE_BYTES) throw new Error("Official release archive exceeds the size limit.");
  let totalSize = 0;
  const entries = unzipSync(bytes, {
    filter(file) {
      safeArchivePath(file.name);
      if (file.originalSize > MAX_ARCHIVE_ENTRY_BYTES) throw new Error(`Archive entry exceeds the size limit: ${file.name}.`);
      totalSize += file.originalSize;
      if (totalSize > MAX_ARCHIVE_TOTAL_BYTES) throw new Error("Expanded archive exceeds the total size limit.");
      return true;
    },
  });
  return new Map(Object.entries(entries).map(([path, value]) => [safeArchivePath(path), value]));
}

export function selectUniqueArchiveEntry(entries: Map<string, Uint8Array>, pattern: RegExp) {
  const matches = [...entries.entries()].filter(([path]) => pattern.test(path));
  if (matches.length !== 1) throw new Error(`Expected exactly one archive entry matching ${pattern}; found ${matches.length}.`);
  return matches[0]!;
}

export function assertArchiveFileTypes(entries: Map<string, Uint8Array>, allowedExtensions: string[]) {
  const normalized = allowedExtensions.map((extension) => extension.toLowerCase());
  for (const path of entries.keys()) {
    if (path.endsWith("/")) continue;
    if (!normalized.some((extension) => path.toLowerCase().endsWith(extension))) {
      throw new Error(`Unexpected archive file type: ${path}.`);
    }
  }
}

export function discoverOnsAsheRelease(html: string, datasetUrl: string): OfficialRelease {
  const links = [...html.matchAll(/href=["']([^"']+\.zip[^"']*)["']/gi)].map((match) => decodeXml(match[1]!));
  for (const href of links) {
    const decoded = decodeURIComponent(href);
    const match = decoded.match(/\/(20\d{2})(provisional|revised)\/[^/?]+\.zip/i);
    if (!match) continue;
    const downloadUrl = new URL(href, datasetUrl);
    if (downloadUrl.hostname !== "www.ons.gov.uk" || downloadUrl.pathname !== "/file") throw new Error("ONS release download resolved outside the official file endpoint.");
    return { year: match[1]!, edition: match[2]!.toLowerCase() as OfficialRelease["edition"], downloadUrl: downloadUrl.toString() };
  }
  throw new Error("ONS ASHE release discovery failed: no versioned ZIP download was found.");
}

function sharedStrings(entries: Map<string, Uint8Array>) {
  const xml = entries.get("xl/sharedStrings.xml");
  if (!xml) return [];
  return [...strFromU8(xml).matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)].map((match) =>
    [...match[1]!.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((text) => decodeXml(text[1]!)).join("")
  );
}

function worksheetPath(entries: Map<string, Uint8Array>, sheetName: string) {
  const workbook = entries.get("xl/workbook.xml");
  const relationships = entries.get("xl/_rels/workbook.xml.rels");
  if (!workbook || !relationships) throw new Error("Malformed XLSX: workbook metadata is missing.");
  const sheet = [...strFromU8(workbook).matchAll(/<sheet\b([^>]*)\/?\s*>/g)]
    .map((match) => match[1]!)
    .find((attributes) => new RegExp(`name=["']${sheetName}["']`).test(attributes));
  const relationId = sheet?.match(/r:id=["']([^"']+)["']/)?.[1];
  if (!relationId) throw new Error(`ONS ASHE workbook schema changed: sheet ${sheetName} is missing.`);
  const relationship = [...strFromU8(relationships).matchAll(/<Relationship\b([^>]*)\/?\s*>/g)]
    .map((match) => match[1]!)
    .find((attributes) => attributes.match(/Id=["']([^"']+)["']/)?.[1] === relationId);
  const target = relationship?.match(/Target=["']([^"']+)["']/)?.[1];
  if (!target || target.includes("..")) throw new Error("Malformed XLSX: worksheet relationship is unsafe or missing.");
  return target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^\.\//, "")}`;
}

function columnIndex(reference: string) {
  const letters = reference.match(/^[A-Z]+/)?.[0];
  if (!letters) throw new Error(`Malformed XLSX cell reference: ${reference}.`);
  return [...letters].reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

export function readXlsxSheet(bytes: Uint8Array, sheetName: string) {
  const entries = inspectZipArchive(bytes);
  const path = worksheetPath(entries, sheetName);
  const worksheet = entries.get(path);
  if (!worksheet) throw new Error(`Malformed XLSX: worksheet entry ${path} is missing.`);
  const strings = sharedStrings(entries);
  const rows: Array<Array<string | number | null>> = [];
  for (const rowMatch of strFromU8(worksheet).matchAll(/<row\b([^>]*)>([\s\S]*?)<\/row>/g)) {
    const rowNumber = Number(rowMatch[1]!.match(/r=["'](\d+)["']/)?.[1]);
    if (!Number.isInteger(rowNumber) || rowNumber < 1) throw new Error("Malformed XLSX: row reference is missing.");
    const row: Array<string | number | null> = [];
    for (const cellMatch of rowMatch[2]!.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)) {
      const attributes = cellMatch[1]!;
      const body = cellMatch[2]!;
      const reference = attributes.match(/r=["']([^"']+)["']/)?.[1];
      if (!reference) throw new Error("Malformed XLSX: cell reference is missing.");
      const type = attributes.match(/t=["']([^"']+)["']/)?.[1];
      const raw = body.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? body.match(/<t\b[^>]*>([\s\S]*?)<\/t>/)?.[1];
      let value: string | number | null = null;
      if (raw !== undefined) {
        if (type === "s") value = strings[Number(raw)] ?? null;
        else if (type === "inlineStr" || type === "str") value = decodeXml(raw);
        else value = Number.isFinite(Number(raw)) ? Number(raw) : decodeXml(raw);
      }
      row[columnIndex(reference)] = value;
    }
    rows[rowNumber - 1] = row;
  }
  return rows;
}
