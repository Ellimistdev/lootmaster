import { titleStat } from "./lootLogic";

export function exportRankedCsv(ranked) {
  const rows = [["Boss", "Item", "S", "A", "Trash"]];

  ranked.forEach((entry) => {
    const formatTier = (groups) => groups.map((group) => group.specs.map((specRow) => specRow.spec.short).join(" = ")).join(" > ");
    rows.push([
      entry.item.boss || "",
      `${entry.item.name} - ${entry.item.stats.map(titleStat).join("/")}`,
      formatTier(entry.s),
      formatTier(entry.a),
      formatTier(entry.trash),
    ]);
  });

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "loot_ranking_output.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
