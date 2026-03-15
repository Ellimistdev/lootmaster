import { Fragment } from "react";
import TierText from "./TierText";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";
import { titleStat } from "../utils/lootLogic";
import ItemDetailPanel from "./ItemDetailPanel";

export default function RankedItemsList({ ranked, selectedItem, onSelectItem, onSpecPress }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle className="text-zinc-50">Items</CardTitle>
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

        <div className="hidden md:block rounded-2xl border border-zinc-800 bg-black">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-zinc-950 sticky top-0 z-10">
              <tr className="text-left border-b border-zinc-800 text-zinc-100">
                <th className="p-3 w-[34%]">Item</th>
                <th className="p-3 w-[23%]">S</th>
                <th className="p-3 w-[23%]">A</th>
                <th className="p-3 w-[20%]">Trash</th>
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
