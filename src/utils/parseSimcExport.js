// SimulationCraft addon bonusrolls.lua exports currency:source:context:keyLevel:itemId:specId.
// Each entry is an awarded item, not a progress counter.
export function parseSimcExport(input) {
  if (typeof input !== "string" || !input.trim()) throw new Error("Paste a SimulationCraft export.");
  const lines = input.split(/\r?\n/);
  const field = (name) => {
    const match = lines.find((line) => new RegExp("^#?\\s*" + name + "=").test(line));
    return match?.split("=").slice(1).join("=").trim() ?? null;
  };
  const characterMatch = lines.find((line) => /^\w+="[^"]+"/.test(line));
  const header = lines.find((line) => /^#\s+.+\s+-\s+.+\s+-\s+\d{4}-\d{2}-\d{2}/.test(line));
  const raw = field("bonus_roll_items");
  if (!characterMatch && raw === null) throw new Error("No recognizable SimulationCraft character or bonus-roll data found.");
  const rolls = [];
  const warnings = [];
  if (raw) {
    raw.split("/").forEach((record, index) => {
      const values = record.split(":");
      if (values.length !== 6 || values.some((value) => !/^\d+$/.test(value))) {
        warnings.push("Skipped invalid bonus-roll record " + (index + 1));
        return;
      }
      const [currency, source, context, keyLevel, itemId, specId] = values.map(Number);
      rolls.push({ currency, source, context, keyLevel, itemId, specId });
    });
  }
  const currencies = {};
  const currencyRaw = field("bonus_roll_currencies");
  if (currencyRaw) currencyRaw.split("/").forEach((entry) => {
    const match = /^(\d+):(\d+)$/.exec(entry);
    if (match) currencies[match[1]] = Number(match[2]);
    else warnings.push("Skipped invalid currency balance");
  });
  return {
    character: characterMatch?.match(/^\w+="([^"]+)"/)?.[1] ?? null,
    spec: field("spec"),
    region: field("region"),
    server: field("server"),
    header: header?.replace(/^#\s*/, "") ?? null,
    rolls,
    currencies,
    warnings,
  };
}
