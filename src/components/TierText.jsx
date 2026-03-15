function displayStat(stat) {
  return { crit: "Crit", haste: "Haste", mastery: "Mastery", vers: "Vers" }[stat] || stat;
}

function buildTooltip(row, item) {
  const itemStats = item?.stats?.length ? item.stats.map(displayStat).join(" / ") : "None";
  const fullSpecName = row?.spec?.full || "Unknown Spec";

  return [
    `${fullSpecName}`,
    `Effective priority: ${row.spec.priority}`,
    `Item secondaries: ${itemStats}`,
    `Why this position: ${row.result.reason}`,
  ].join("\n");
}

export default function TierText({ groups, item }) {
  if (!groups.length) return <span className="text-zinc-500">—</span>;

  return (
    <span className="leading-6 text-zinc-100">
      {groups.map((g, idx) => (
        <span key={idx}>
          {idx > 0 ? " > " : ""}
          {g.specs.map((row, i) => (
            <span key={row.spec.full}>
              {i > 0 ? " = " : ""}
              <span style={{ color: row.spec.color }} title={buildTooltip(row, item)}>{row.spec.short}</span>
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
