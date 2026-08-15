function displayStat(stat) {
  return { crit: "Crit", haste: "Haste", mastery: "Mastery", vers: "Vers" }[stat] || stat;
}

function buildTooltip(row, item) {
  const itemStats = item?.stats?.length ? item.stats.map(displayStat).join(" / ") : "None";

  return [
    row?.spec?.full || "Unknown Spec",
    `Effective priority: ${row.spec.priority}`,
    `Item secondaries: ${itemStats}`,
    `Why this position: ${row.result.reason}`,
  ].join("\n");
}

export default function TierText({ groups, item, onSpecPress, playerNamesBySpec = {} }) {
  if (!groups.length) return <span className="text-zinc-500">—</span>;

  return (
    <span className="leading-6 text-zinc-100">
      {groups.map((group, groupIndex) => (
        <span key={groupIndex}>
          {groupIndex > 0 && (
            <>
              <span className="text-zinc-100"> &gt;</span>
              <br />
            </>
          )}

          {group.specs.map((row, specIndex) => {
            const names = playerNamesBySpec[row.spec.full];
            const label = names?.length ? names.join("/") : row.spec.short;
            const baseTooltip = buildTooltip(row, item);
            const tooltip = names?.length
              ? `${names.join(" / ")}\n${baseTooltip}`
              : baseTooltip;

            return (
              <span key={row.spec.full}>
                {specIndex > 0 ? " = " : ""}
                {onSpecPress ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSpecPress(row, item);
                    }}
                    className="underline decoration-dotted underline-offset-2"
                    style={{ color: row.spec.color }}
                    title={tooltip}
                  >
                    {label}
                  </button>
                ) : (
                  <span style={{ color: row.spec.color }} title={tooltip}>
                    {label}
                  </span>
                )}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
