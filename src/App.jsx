import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui";
import StickyControlsPanel from "./components/StickyControlsPanel";
import RankedItemsList from "./components/RankedItemsList";
import MobileSpecDetailSheet from "./components/MobileSpecDetailSheet";
import RankingFooter from "./components/RankingFooter";
import { SPEC_DATA_UPDATED_AT, SPEC_DATA_VERSION } from "./data/constants";
import { useComputed } from "./hooks/useComputed";
import { titleStat } from "./utils/lootLogic";
import { useSpecOverrides } from "./hooks/useSpecOverrides";
import { useItemSelection } from "./hooks/useItemSelection";

const GITHUB_ISSUES_URL = "https://github.com/Ellimistdev/lootmaster/issues";

export default function LootRankingApp() {
  const [manualItemsText, setManualItemsText] = useState("");
  const [showManualItems, setShowManualItems] = useState(false);
  const [bossFilter, setBossFilter] = useState("All bosses");
  const [query, setQuery] = useState("");
  const {
    showSpecOverrides,
    setShowSpecOverrides,
    specOverrides,
    selectedClass,
    selectedSpecName,
    draftOverride,
    importOverridesInputRef,
    classOptions,
    specOptionsForClass,
    selectedSpec,
    handleSelectedClassChange,
    handleSelectedSpecChange,
    updateSelectedSpec,
    applySelectedSpecOverride,
    resetSelectedSpec,
    resetAllSpecs,
    exportSpecOverrides,
    importSpecOverridesFromFile,
  } = useSpecOverrides();
  const { selectedItem, mobileSpecDetail, handleSelectItem, openMobileSpecDetail, closeMobileSpecDetail } = useItemSelection();
  const { ranked, defaultItemCount, manualItemCount, overrideCount, effectiveRows, bossOptions } = useComputed(manualItemsText, specOverrides, query, bossFilter);

  const exportCsv = () => {
    const rows = [["Boss", "Item", "S", "A", "Trash"]];
    ranked.forEach((r) => {
      const fmt = (groups) => groups.map((g) => g.specs.map((s) => s.spec.short).join(" = ")).join(" > ");
      rows.push([r.item.boss || "", `${r.item.name} - ${r.item.stats.map(titleStat).join("/")}`, fmt(r.s), fmt(r.a), fmt(r.trash)]);
    });
    const csv = rows.map((r) => r.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loot_ranking_output.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-50">Midnight Loot Master</h1>
            <p className="text-zinc-300 mt-2">Loaded with the Season 1 raid loot table. Manual item input is optional if you want to add one-off entries.</p>
            <p className="text-zinc-400 text-sm mt-2">Spec data: {SPEC_DATA_VERSION} • Updated: {SPEC_DATA_UPDATED_AT}</p>
            <p className="text-amber-400/80 text-sm mt-2">
              ⚠ This tool ranks specs by <strong>secondary stat priorities only</strong> - trinkets are excluded from the table.
            </p>
            <p className="text-amber-400/80 text-sm mt-2">
              For trinket rankings visit{" "}
              <a href="https://bloodmallet.com/chart/trinket_compare" target="_blank" rel="noreferrer" className="underline hover:text-amber-300">bloodmallet</a>
              {" "}or{" "}
              <a href="https://questionablyepic.com/live/trinkets" target="_blank" rel="noreferrer" className="underline hover:text-amber-300">Questionably Epic</a>
              {" "}(healers).
            </p>
          </div>

        </div>

        <div className="space-y-6">
          <StickyControlsPanel
            defaultItemCount={defaultItemCount}
            manualItemCount={manualItemCount}
            overrideCount={overrideCount}
            showManualItems={showManualItems}
            onToggleManualItems={() => setShowManualItems((v) => !v)}
            showSpecOverrides={showSpecOverrides}
            onToggleSpecOverrides={() => setShowSpecOverrides((v) => !v)}
            manualItemsText={manualItemsText}
            onManualItemsTextChange={setManualItemsText}
            classOptions={classOptions}
            specOptionsForClass={specOptionsForClass}
            selectedClass={selectedClass}
            onSelectedClassChange={handleSelectedClassChange}
            selectedSpecName={selectedSpecName}
            onSelectedSpecChange={handleSelectedSpecChange}
            selectedSpec={selectedSpec}
            specOverrides={specOverrides}
            draftOverride={draftOverride}
            onUpdateSelectedSpec={updateSelectedSpec}
            onApplySelectedSpecOverride={applySelectedSpecOverride}
            onResetSelectedSpec={resetSelectedSpec}
            onResetAllSpecs={resetAllSpecs}
            onExportSpecOverrides={exportSpecOverrides}
            onImportSpecOverridesClick={() => importOverridesInputRef.current?.click()}
            importOverridesInputRef={importOverridesInputRef}
            onImportSpecOverridesFromFile={importSpecOverridesFromFile}
            bossFilter={bossFilter}
            onBossFilterChange={setBossFilter}
            bossOptions={bossOptions}
            query={query}
            onQueryChange={setQuery}
            onExportCsv={exportCsv}
          />

          <RankedItemsList ranked={ranked} selectedItem={selectedItem} onSelectItem={handleSelectItem} onSpecPress={openMobileSpecDetail} />
        </div>

        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-zinc-50">Effective Spec Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-72 overflow-auto rounded-2xl border border-zinc-800 bg-black">
              <table className="w-full text-sm">
                <thead className="bg-zinc-950 sticky top-0 z-10">
                  <tr className="text-left border-b border-zinc-800 text-zinc-100">
                    <th className="p-3">Spec</th>
                    <th className="p-3">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {effectiveRows.map(([full, parts]) => (
                    <tr key={full} className="border-b border-zinc-800">
                      <td className="p-3 text-zinc-200">{full}</td>
                      <td className="p-3 text-zinc-100 font-mono">{parts[0]} {parts[1]} {parts[2]} {parts[3]} {parts[4]} {parts[5]} {parts[6]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <MobileSpecDetailSheet detail={mobileSpecDetail} onClose={closeMobileSpecDetail} />

        <RankingFooter githubIssuesUrl={GITHUB_ISSUES_URL} />
      </div>
    </div>
  );
}
