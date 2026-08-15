import { Fragment } from "react";
import { Download, Search } from "lucide-react";
import { titleStat } from "../utils/lootLogic";
import ItemDetailPanel from "./ItemDetailPanel";
import TierText from "./TierText";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "./ui";

function ItemSummary({ item }) {
  return (
    <>
      <div className="font-semibold text-zinc-50">{item.name}</div>
      <div className="mt-1 text-xs text-zinc-400">
        {item.slot} • {item.type} •{" "}
        {item.primary ? `Primary: ${item.primary}` : "No primary stat restriction"}
        {item.stats.length ? ` • ${item.stats.map(titleStat).join("/")}` : ""}
      </div>
      {item.error && <div className="mt-1 text-xs text-amber-400">{item.error}</div>}
    </>
  );
}

export default function RankedItemsList({
  ranked = [],
  selectedItem,
  onSelectItem,
  onSpecPress,
  bossFilter = "All bosses",
  onBossFilterChange,
  bossOptions = [],
  query = "",
  onQueryChange,
  onExportCsv = () => {},
  playerNamesBySpec = {},
}) {
  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900 shadow-2xl">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardTitle className="text-zinc-50">Items</CardTitle>
        <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-end xl:w-auto xl:flex-nowrap">
          <select
            value={bossFilter}
            onChange={(event) => onBossFilterChange?.(event.target.value)}
            className="rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
          >
            <option value="All bosses">All bosses</option>
            {bossOptions.map((boss) => (
              <option key={boss} value={boss}>
                {boss}
              </option>
            ))}
          </select>
          <div className="relative flex-1 md:min-w-[16rem] xl:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
            <Input
              value={query}
              onChange={(event) => onQueryChange?.(event.target.value)}
              placeholder="Filter items..."
              className="border-zinc-700 bg-black pl-9 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <Button
            className="shrink-0 bg-sky-600 text-white hover:bg-sky-500"
            onClick={onExportCsv}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
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
                className={`w-full rounded-2xl border p-4 text-left transition hover:bg-zinc-900/80 ${
                  selectedItem?.item.id === row.item.id
                    ? "border-sky-500 bg-zinc-900/80"
                    : "border-zinc-800 bg-black"
                }`}
              >
                <ItemSummary item={row.item} />
                <div className="mt-3 space-y-2 text-sm">
                  <div>
                    <span className="text-zinc-400">S:</span>{" "}
                    <TierText
                      groups={row.s}
                      item={row.item}
                      onSpecPress={onSpecPress}
                      playerNamesBySpec={playerNamesBySpec}
                    />
                  </div>
                  <div>
                    <span className="text-zinc-400">A:</span>{" "}
                    <TierText
                      groups={row.a}
                      item={row.item}
                      onSpecPress={onSpecPress}
                      playerNamesBySpec={playerNamesBySpec}
                    />
                  </div>
                  <div>
                    <span className="text-zinc-400">Trash:</span>{" "}
                    <TierText
                      groups={row.trash}
                      item={row.item}
                      onSpecPress={onSpecPress}
                      playerNamesBySpec={playerNamesBySpec}
                    />
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

        <div className="hidden max-h-[60vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-black md:block">
          <table className="w-full table-fixed text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-950">
              <tr className="border-b border-zinc-800 text-left text-zinc-100">
                <th className="w-[34%] p-3 text-center">Item</th>
                <th className="w-[23%] p-3 text-center">S</th>
                <th className="w-[23%] p-3 text-center">A</th>
                <th className="w-[20%] p-3 text-center">Trash</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((row) => (
                <Fragment key={row.item.id}>
                  <tr
                    className={`cursor-pointer border-b border-zinc-800 hover:bg-zinc-900/80 ${
                      selectedItem?.item.id === row.item.id ? "bg-zinc-900/80" : ""
                    }`}
                    onClick={() => onSelectItem(row)}
                  >
                    <td className="break-words p-3 align-top text-zinc-100">
                      <ItemSummary item={row.item} />
                    </td>
                    <td className="p-3 align-top">
                      <TierText
                        groups={row.s}
                        item={row.item}
                        playerNamesBySpec={playerNamesBySpec}
                      />
                    </td>
                    <td className="p-3 align-top">
                      <TierText
                        groups={row.a}
                        item={row.item}
                        playerNamesBySpec={playerNamesBySpec}
                      />
                    </td>
                    <td className="p-3 align-top">
                      <TierText
                        groups={row.trash}
                        item={row.item}
                        playerNamesBySpec={playerNamesBySpec}
                      />
                    </td>
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
