import { Fragment } from "react";
import TierText from "./TierText";
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from "./ui";
import { titleStat } from "../utils/lootLogic";
import ItemDetailPanel from "./ItemDetailPanel";
import { Download, Search } from "lucide-react";

export default function RankedItemsList({ ranked, selectedItem, onSelectItem, onSpecPress, bossFilter, onBossFilterChange, bossOptions = [], query, onQueryChange, onExportCsv }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-zinc-50">Items</CardTitle>
        <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-end xl:w-auto xl:flex-nowrap">
          <select
            value={bossFilter}
            onChange={(e) => onBossFilterChange?.(e.target.value)}
            className="rounded-xl border border-zinc-700 bg-black text-zinc-100 px-3 py-2"
          >
            <option value="All bosses">All bosses</option>
            {bossOptions.map((boss) => (
              <option key={boss} value={boss}>{boss}</option>
            ))}
          </select>
          <div className="relative flex-1 md:min-w-[16rem] xl:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
            <Input value={query} onChange={(e) => onQueryChange?.(e.target.value)} placeholder="Filter items..." className="pl-9 bg-black text-zinc-100 placeholder:text-zinc-500 border-zinc-700" />
          </div>
          <Button className="bg-sky-600 text-white hover:bg-sky-500 shrink-0" onClick={onExportCsv}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 md:hidden">
          {ranked.map((row) => (
            <Fragment key={row.item.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectItem(row)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectItem(row);
                  }
                }}
                className={`w-full rounded-2xl border p-4 text-left transition hover:bg-zinc-900/80 ${selectedItem?.item.id === row.item.id ? "border-sky-500 bg-zinc-900/80" : "border-zinc-800 bg-black"}`}
              >
                <div className="font-semibold text-zinc-50">{row.item.name}</div>
                <div className="mt-1 text-xs text-zinc-400">
                  {row.item.slot} • {row.item.type} • {row.item.primary ? `Primary: ${row.item.primary}` : "No primary stat restriction"}
                  {row.item.stats.length ? ` • ${row.item.stats.map(titleStat).join("/")}` : ""}
                </div>
                {row.item.error && <div className="mt-1 text-xs text-amber-400">{row.item.error}</div>}

                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <span className="text-zinc-400">S:</span>{" "}
                    <TierText groups={row.s} item={row.item} onSpecPress={onSpecPress} />
                  </div>
                  <div>
                    <span className="text-zinc-400">A:</span>{" "}
                    <TierText groups={row.a} item={row.item} onSpecPress={onSpecPress} />
                  </div>
                  <div>
                    <span className="text-zinc-400">Trash:</span>{" "}
                    <TierText groups={row.trash} item={row.item} onSpecPress={onSpecPress} />
                  </div>
                </div>
              </div>

              {selectedItem?.item.id === row.item.id && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <ItemDetailPanel row={row} />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        <div className="hidden md:block rounded-2xl border border-zinc-800 bg-black max-h-[60vh] overflow-y-auto">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-zinc-950 sticky top-0 z-10">
              <tr className="text-left border-b border-zinc-800 text-zinc-100">
                <th className="p-3 w-[34%] text-center">Item</th>
                <th className="p-3 w-[23%] text-center">S</th>
                <th className="p-3 w-[23%] text-center">A</th>
                <th className="p-3 w-[20%] text-center">Trash</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row) => (
                <Fragment key={row.item.id}>
                  <tr className={`border-b border-zinc-800 cursor-pointer hover:bg-zinc-900/80 ${selectedItem?.item.id === row.item.id ? "bg-zinc-900/80" : ""}`} onClick={() => onSelectItem(row)}>
                    <td className="p-3 align-top break-words text-zinc-100">
                      <div className="font-semibold text-zinc-50">{row.item.name}</div>
                      <div className="text-zinc-400 text-xs mt-1">
                        {row.item.slot} • {row.item.type} • {row.item.primary ? `Primary: ${row.item.primary}` : "No primary stat restriction"}
                        {row.item.stats.length ? ` • ${row.item.stats.map(titleStat).join("/")}` : ""}
                      </div>
                      {row.item.error && <div className="text-amber-400 text-xs mt-1">{row.item.error}</div>}
                    </td>
                    <td className="p-3 align-top"><TierText groups={row.s} item={row.item} /></td>
                    <td className="p-3 align-top"><TierText groups={row.a} item={row.item} /></td>
                    <td className="p-3 align-top"><TierText groups={row.trash} item={row.item} /></td>
                  </tr>

                  {selectedItem?.item.id === row.item.id && (
                    <tr className="border-b border-zinc-800 bg-zinc-950/80">
                      <td colSpan={4} className="p-4">
                        <ItemDetailPanel row={row} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
