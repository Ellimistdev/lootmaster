import { Badge } from "./ui";
import { titleStat } from "../utils/lootLogic";

export default function ItemDetailPanel({ row }) {
  if (!row) return null;

  return (
    <div className="space-y-4">
      <div className="text-sm text-zinc-300">
        {row.item.boss} • {row.item.slot} • {row.item.type} • {row.item.primary ? `Primary: ${row.item.primary}` : "No primary stat restriction"}
        {row.item.stats.length ? ` • ${row.item.stats.map(titleStat).join("/")}` : ""}
      </div>
      {row.item.error && <div className="text-sm text-amber-400">{row.item.error}</div>}
      <div className="space-y-2">
        {!row.detail.length && (
          <div className="p-3 rounded-xl bg-black border border-zinc-800 text-sm text-zinc-400">
            {row.item.error ? "This manual item could not be ranked until the input is corrected." : "No eligible specs found for this item."}
          </div>
        )}
        {row.detail.map((detailRow) => (
          <div key={detailRow.spec.full} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black border border-zinc-800">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-100 border border-zinc-700">{detailRow.result.tier}</Badge>
              <span style={{ color: detailRow.spec.color }} className="font-semibold">{detailRow.spec.short}</span>
              <span className="text-zinc-400 text-sm">{detailRow.spec.full}</span>
            </div>
            <div className="text-sm text-zinc-300">Rank {detailRow.result.rank} • {detailRow.result.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
