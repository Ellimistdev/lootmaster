import {
  ARMOR_BY_CLASS,
  CLASS_COLORS,
  DEFAULT_SPEC_ROWS,
  PRIMARY_STAT_BY_SPEC,
  SECONDARIES,
  STAT_ALIASES,
} from "../data/constants";

export function normStat(s) {
  if (!s) return "";
  const key = String(s).trim().toLowerCase();
  return STAT_ALIASES[key] || key;
}

export function titleStat(s) {
  return { crit: "Crit", haste: "Haste", mastery: "Mastery", vers: "Vers" }[s] || s;
}

export function normalizePrimaryStat(stat) {
  return String(stat || "").trim().toLowerCase();
}

export function parsePrimaryOptions(primary) {
  if (!primary) return [];

  return String(primary)
    .split("/")
    .map((part) => normalizePrimaryStat(part))
    .filter(Boolean);
}

export function shortSpecName(full) {
  const [, spec] = full.split(" - ").map((x) => x.trim());
  const map = {
    "Death Knight - Frost": "Frost",
    "Druid - Restoration": "Resto",
    "Paladin - Retribution": "Ret",
    "Paladin - Protection": "Prot",
    "Paladin - Holy": "Holy",
    "Priest - Holy": "Holy",
    "Priest - Discipline": "Disc",
    "Shaman - Restoration": "Resto",
    "Warrior - Protection": "Prot",
    "Warlock - Affliction": "Aff",
    "Warlock - Demonology": "Demo",
    "Warlock - Destruction": "Destro",
    "Mage - Frost": "Frost",
    "Mage - Fire": "Fire",
    "Mage - Arcane": "Arcane",
    "Shaman - Elemental": "Ele",
    "Shaman - Enhancement": "Enh",
    "Druid - Balance": "Balance",
    "Druid - Feral": "Feral",
    "Druid - Guardian": "Guardian",
    "Hunter - Beast Mastery": "BM",
    "Hunter - Marksmanship": "MM",
    "Hunter - Survival": "Surv",
    "Monk - Mistweaver": "Mist",
    "Monk - Windwalker": "WW",
    "Monk - Brewmaster": "Brew",
    "Rogue - Assassination": "Assn",
    "Rogue - Outlaw": "Outlaw",
    "Rogue - Subtlety": "Sub",
    "Evoker - Preservation": "Pres",
    "Evoker - Devastation": "Dev",
    "Evoker - Augmentation": "Aug",
    "Demon Hunter - Havoc": "Havoc",
    "Demon Hunter - Vengeance": "Veng",
    "Demon Hunter - Devourer": "Devourer",
  };
  return map[full] || spec;
}

export function parsePriority(raw) {
  let s = raw.toLowerCase();
  s = s.replace(/~=|>=/g, "=");
  s = s.replace(/>>/g, ">");
  s = s.replace(/critical strike/g, "crit");
  s = s.replace(/versatility|verse/g, "vers");
  s = s.replace(/mastery/g, "mast");
  s = s.replace(/\(.*?\)/g, " ");
  s = s.replace(/\d+%?/g, " ");
  ["intellect", "int", "agility", "agi", "strength", "str", "ilevel", "stam", "stamina"].forEach((p) => {
    s = s.replace(new RegExp(`\\b${p}\\b`, "g"), " ");
  });
  s = s.replace(/\s+/g, " ").trim();

  const tiers = [];
  for (const token of s.split(">")) {
    const cleaned = token.trim();
    if (!cleaned) continue;
    const stats = [];
    for (const part of cleaned.split("=")) {
      const stat = normStat(part.replace(/[^a-z ]/g, "").trim());
      if (SECONDARIES.includes(stat) && !stats.includes(stat)) stats.push(stat);
    }
    if (stats.length) tiers.push(stats);
  }

  const flat = [];
  for (const tier of tiers) {
    for (const stat of tier) {
      if (!flat.includes(stat)) flat.push(stat);
    }
    if (flat.length >= 2) break;
  }

  return {
    raw,
    tiers,
    top1: flat[0] || null,
    top2: flat[1] || null,
    top1Tier: new Set(tiers[0] || []),
  };
}

export function flattenBossLoot(table) {
  let id = 1;
  const rows = [];

  Object.entries(table).forEach(([boss, items]) => {
    items.forEach((entry) => {
      const stats = [normStat(entry.stat1), normStat(entry.stat2)]
        .filter(Boolean)
        .filter((s) => SECONDARIES.includes(s));

      rows.push({
        id: id++,
        boss,
        raw: JSON.stringify(entry),
        name: entry.item,
        slot: entry.slot,
        type: entry.type,
        primary: entry.primary,
        big: stats[0] || null,
        small: stats[1] || null,
        stats,
        source: "default",
        error: null,
      });
    });
  });

  return rows;
}

function normalizePrimaryInput(value) {
  if (!value) return null;

  const alias = {
    int: "int",
    intellect: "int",
    agi: "agi",
    agility: "agi",
    str: "str",
    strength: "str",
  };

  const normalized = String(value)
    .split("/")
    .map((part) => alias[String(part).trim().toLowerCase()])
    .filter(Boolean);

  if (!normalized.length) return null;

  const pretty = { int: "Int", agi: "Agi", str: "Str" };
  return [...new Set(normalized)].map((s) => pretty[s]).join("/");
}

function looksLikePrimaryInput(value) {
  return Boolean(normalizePrimaryInput(value));
}

function splitCommaSeparatedLine(line) {
  const parts = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  parts.push(current.trim());
  return parts.filter((part) => part.length > 0);
}

export function parseManualItems(text, startId = 100000) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const parts = splitCommaSeparatedLine(line);

      if (parts.length < 4) {
        return {
          id: startId + idx + 1,
          boss: "Manual Additions",
          raw: line,
          name: parts[0] || `Manual Item ${idx + 1}`,
          slot: parts[1] || "Unknown slot",
          type: parts[2] || "Unknown type",
          primary: null,
          big: null,
          small: null,
          stats: [],
          source: "manual",
          error: "Expected comma-separated fields: Name, Slot, Type, Stat1, Stat2 (optional: Primary before stats).",
        };
      }

      const name = parts[0];
      const slot = parts[1] || "";
      const type = parts[2] || "";
      const stats = [];
      let primary = null;
      let statsStartIndex = 3;

      if (parts.length >= 5 && looksLikePrimaryInput(parts[3])) {
        primary = normalizePrimaryInput(parts[3]);
        statsStartIndex = 4;
      }

      for (let i = statsStartIndex; i < parts.length; i++) {
        const stat = normStat(parts[i]);
        if (SECONDARIES.includes(stat) && !stats.includes(stat)) stats.push(stat);
      }

      const secondaryStats = stats.slice(0, 2);

      return {
        id: startId + idx + 1,
        boss: "Manual Additions",
        raw: line,
        name,
        slot,
        type,
        primary,
        big: secondaryStats[0] || null,
        small: secondaryStats[1] || null,
        stats: secondaryStats,
        source: "manual",
        error: secondaryStats.length
          ? null
          : "No recognizable secondary stats found. Use Crit/Haste/Mastery/Vers.",
      };
    });
}

export function specRowsToText(rows) {
  return rows
    .map(
      ([full, parts]) => {
        const primaryStat = PRIMARY_STAT_BY_SPEC[full] || "Int";
        return `${full}\t${primaryStat} > ${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]} ${parts[4]} ${parts[5]} ${parts[6]}`;
      },
    )
    .join("\n");
}

export function primaryStatForSpec(fullSpecName) {
  return PRIMARY_STAT_BY_SPEC[fullSpecName] || "Int";
}

export function defaultSpecMap() {
  return Object.fromEntries(
    DEFAULT_SPEC_ROWS.map(([full, parts]) => [
      full,
      { stats: [parts[0], parts[2], parts[4], parts[6]], comps: [parts[1], parts[3], parts[5]] },
    ]),
  );
}

export function buildEffectiveSpecRows(overrides) {
  const base = defaultSpecMap();
  Object.entries(overrides).forEach(([full, value]) => {
    base[full] = value;
  });

  return Object.entries(base)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([full, value]) => [
      full,
      [
        value.stats[0],
        value.comps[0],
        value.stats[1],
        value.comps[1],
        value.stats[2],
        value.comps[2],
        value.stats[3],
      ],
    ]);
}

export function parseSpecs(text) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      const parts = line
        .split("\t")
        .map((x) => x.trim())
        .filter(Boolean);

      if (parts.length < 2) {
        return { id: idx + 1, raw: line, error: "Expected 'Class - Spec<TAB>Priority'." };
      }

      const full = parts[0];
      const priority = parts.slice(1).join(" ");
      const [cls, spec] = full.split(" - ").map((x) => x.trim());
      const parsed = parsePriority(priority);

      return {
        id: idx + 1,
        raw: line,
        full,
        className: cls,
        specName: spec,
        primaryStat: normalizePrimaryStat(primaryStatForSpec(full)),
        short: shortSpecName(full),
        armor: ARMOR_BY_CLASS[cls] || "",
        color: CLASS_COLORS[cls] || "#e5e7eb",
        priority,
        ...parsed,
        error: !cls || !spec ? "Spec name must be formatted as 'Class - Spec'." : null,
      };
    });
}

export function weaponCategory(item) {
  const type = item.type.toLowerCase();
  const primaryOptions = parsePrimaryOptions(item.primary);

  if (type.includes("offhand") || type.includes("off hand")) return "int-offhand";
  if (type.includes("shield")) return "shield";
  if (type.includes("gun")) return "gun";
  if (type.includes("bow")) return "bow";
  if (type.includes("crossbow")) return "crossbow";
  if (type.includes("warglaive")) return primaryOptions.includes("int") ? "int-warglaive" : "warglaive";
  if (type.includes("fist")) return "fist";
  if (type.includes("polearm")) return primaryOptions.includes("agi") ? "agi-polearm" : "generic-weapon";
  if (type.includes("staff")) {
    if (primaryOptions.includes("int")) return "int-staff";
    if (primaryOptions.includes("agi")) return "agi-staff";
  }
  if (type.includes("dagger")) {
    if (primaryOptions.length === 1 && primaryOptions.includes("int")) return "int-dagger";
    if (primaryOptions.includes("agi")) return "agi-dagger";
  }
  if (type.includes("1h sword")) {
    if (primaryOptions.length === 1 && primaryOptions.includes("int")) return "int-sword";
    if (primaryOptions.length === 1 && primaryOptions.includes("str")) return "1h-str-sword";
    if (primaryOptions.includes("agi")) return "1h-agi-sword";
  }
  if (type.includes("1h mace")) {
    if (primaryOptions.length === 1 && primaryOptions.includes("int")) return "int-mace";
    if (primaryOptions.length === 1 && primaryOptions.includes("str")) return "1h-str-mace";
    if (primaryOptions.includes("agi")) return "1h-agi-mace";
  }
  if (type.includes("1h axe")) {
    if (primaryOptions.length === 1 && primaryOptions.includes("str")) return "1h-str-axe";
  }
  if (type.includes("2h sword")) return "2h-str-sword";
  if (type.includes("2h mace")) return primaryOptions.includes("agi") ? "2h-agi-str-mace" : "2h-str-mace";
  if (type.includes("2h axe")) return "2h-str-axe";

  return "generic-weapon";
}

export function specCanUseWeapon(spec, category) {
  const full = spec.full;
  const cls = spec.className;

  const intUsers = new Set([
    "Mage - Arcane",
    "Mage - Frost",
    "Mage - Fire",
    "Priest - Discipline",
    "Priest - Holy",
    "Priest - Shadow",
    "Warlock - Affliction",
    "Warlock - Demonology",
    "Warlock - Destruction",
    "Shaman - Restoration",
    "Shaman - Elemental",
    "Evoker - Preservation",
    "Evoker - Devastation",
    "Evoker - Augmentation",
    "Paladin - Holy",
    "Druid - Restoration",
    "Druid - Balance",
    "Monk - Mistweaver",
  ]);

  switch (category) {
    case "int-mace":
    case "int-dagger":
    case "int-sword":
    case "int-staff":
    case "int-offhand":
      return intUsers.has(full);
    case "shield":
      return new Set([
        "Warrior - Protection",
        "Paladin - Holy",
        "Paladin - Protection",
        "Shaman - Restoration",
        "Shaman - Elemental",
      ]).has(full);
    case "gun":
    case "bow":
    case "crossbow":
      return new Set(["Hunter - Beast Mastery", "Hunter - Marksmanship"]).has(full);
    case "agi-dagger":
      return cls === "Rogue";
    case "fist":
      return new Set(["Rogue - Outlaw", "Shaman - Enhancement", "Monk - Windwalker"]).has(full);
    case "warglaive":
      return cls === "Demon Hunter";
    case "int-warglaive":
      return new Set(["Demon Hunter - Devourer"]).has(full);
    case "agi-polearm":
      return new Set(["Druid - Feral", "Hunter - Survival"]).has(full);
    case "agi-staff":
      return new Set(["Druid - Feral", "Druid - Guardian", "Monk - Windwalker"]).has(full);
    case "1h-agi-mace":
    case "1h-agi-sword":
      return new Set(["Shaman - Enhancement", "Monk - Windwalker", "Rogue - Outlaw", "Hunter - Survival"]).has(full);
    case "1h-str-mace":
    case "1h-str-axe":
    case "1h-str-sword":
      return new Set(["Death Knight - Frost"]).has(full);
    case "2h-str-sword":
    case "2h-str-mace":
    case "2h-str-axe":
      return new Set([
        "Death Knight - Blood",
        "Death Knight - Unholy",
        "Paladin - Retribution",
        "Warrior - Arms",
        "Warrior - Fury",
      ]).has(full);
    case "2h-agi-str-mace":
      return new Set([
        "Death Knight - Blood",
        "Death Knight - Unholy",
        "Paladin - Retribution",
        "Warrior - Arms",
        "Warrior - Fury",
        "Druid - Feral",
        "Druid - Guardian",
        "Hunter - Survival",
        "Monk - Windwalker",
      ]).has(full);
    default:
      return true;
  }
}

export function specCanUseItem(spec, item) {
  if (item.error || spec.error) return false;

  const primaryOptions = parsePrimaryOptions(item.primary);
  if (primaryOptions.length && !primaryOptions.includes(spec.primaryStat)) return false;

  const slot = item.slot.toLowerCase();
  const type = item.type.toLowerCase();
  const armorSlots = [
    "head",
    "helm",
    "shoulder",
    "shoulders",
    "chest",
    "waist",
    "belt",
    "wrist",
    "hands",
    "gloves",
    "legs",
    "feet",
    "boots",
    "bracers",
  ];

  if (armorSlots.includes(slot)) return !type || type.toLowerCase() === spec.armor.toLowerCase();
  if (slot === "weapon") return specCanUseWeapon(spec, weaponCategory(item));
  if (["ring", "neck", "trinket", "back"].includes(slot)) return true;

  return true;
}

export function classify(spec, item) {
  const itemSet = new Set(item.stats);

  if (item.stats.length === 2 && item.stats.every((s) => spec.top1Tier.has(s)) && spec.top1Tier.size >= 2) {
    return {
      tier: "S",
      rank: 0.5,
      reason: "Both item stats are in this spec's highest-priority tie group.",
    };
  }

  const hasTop1 = itemSet.has(spec.top1);
  const hasTop2 = itemSet.has(spec.top2);

  if (hasTop1 && hasTop2) {
    const weightedToward = item.big === spec.top1 ? "first-priority stat" : "second-priority stat";

    return {
      tier: "S",
      rank: item.big === spec.top1 ? 1.0 : 2.0,
      reason: `Matches both first and second priority stats; item is weighted toward the ${weightedToward}.`,
    };
  }

  if (hasTop1 && !hasTop2) {
    return {
      tier: "A",
      rank: 3.0,
      reason: "Matches only this spec's first-priority stat.",
    };
  }

  if (hasTop2 && !hasTop1) {
    return {
      tier: "A",
      rank: 4.0,
      reason: "Matches only this spec's second-priority stat.",
    };
  }

  return {
    tier: "Trash",
    rank: 999,
    reason: "Does not match this spec's first or second priority stats.",
  };
}

export function groupTier(entries, wantedTier) {
  const filtered = entries.filter((e) => e.result.tier === wantedTier);
  filtered.sort((a, b) => a.result.rank - b.result.rank || a.spec.short.localeCompare(b.spec.short));

  const groups = [];
  for (const row of filtered) {
    const last = groups[groups.length - 1];
    if (!last || last.rank !== row.result.rank) {
      groups.push({ rank: row.result.rank, specs: [row] });
    } else {
      last.specs.push(row);
    }
  }

  return groups;
}
