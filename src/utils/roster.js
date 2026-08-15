import { CLASS_LIBRARY, roleForSpec, specKey } from "../data/constants";

const ROSTER_SHARE_PREFIX = "LM1:";

export const titleCaseName = (value) =>
  value
    .toLocaleLowerCase()
    .replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase());

export const memberKey = (member) =>
  `${member.className}::${member.name.trim().toLocaleLowerCase()}`;

export const roleForMember = (member) =>
  roleForSpec(specKey(member.className, member.mainSpec));

function getCodec() {
  const codec = typeof window !== "undefined" ? window.LZString : null;

  if (!codec?.compressToEncodedURIComponent || !codec?.decompressFromEncodedURIComponent) {
    throw new Error("Roster encoder is unavailable. Refresh the page and try again.");
  }

  return codec;
}

export function encodeRoster(roster) {
  const encoded = getCodec().compressToEncodedURIComponent(JSON.stringify(roster));
  return `${ROSTER_SHARE_PREFIX}${encoded}`;
}

export function decodeRoster(value) {
  const trimmed = value.trim();

  if (!trimmed.startsWith(ROSTER_SHARE_PREFIX)) {
    throw new Error("Invalid roster string. Export a roster from Lootmaster and paste the complete encoded value.");
  }

  const decoded = getCodec().decompressFromEncodedURIComponent(
    trimmed.slice(ROSTER_SHARE_PREFIX.length),
  );

  if (!decoded) throw new Error("Roster string could not be decoded.");
  return JSON.parse(decoded);
}

export function normalizeRoster(value) {
  if (!Array.isArray(value)) throw new Error("Decoded roster must be an array.");

  const seen = new Set();

  return value.map((member, index) => {
    if (!member || typeof member !== "object") {
      throw new Error(`Roster member ${index + 1} is invalid.`);
    }

    const name = typeof member.name === "string" ? titleCaseName(member.name.trim()) : "";
    const className = member.className;
    const mainSpec = member.mainSpec;
    const classData = CLASS_LIBRARY[className];

    if (!name || !classData || !classData.specs[mainSpec]) {
      throw new Error(`Roster member ${index + 1} has an invalid name, class, or main spec.`);
    }

    const normalized = { name, className, mainSpec, offSpecs: [] };
    const key = memberKey(normalized);

    if (seen.has(key)) {
      throw new Error(`Duplicate roster member: ${name} (${className}).`);
    }
    seen.add(key);

    const validSpecs = new Set(Object.keys(classData.specs));
    normalized.offSpecs = Array.isArray(member.offSpecs)
      ? [...new Set(member.offSpecs.filter((spec) => validSpecs.has(spec) && spec !== mainSpec))]
      : [];

    return normalized;
  });
}
