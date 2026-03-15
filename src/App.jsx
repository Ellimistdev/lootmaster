import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui";
import StickyControlsPanel from "./components/StickyControlsPanel";
import RankedItemsList from "./components/RankedItemsList";
import MobileSpecDetailSheet from "./components/MobileSpecDetailSheet";
import RankingFooter from "./components/RankingFooter";
import EffectiveSpecLibrary from "./components/EffectiveSpecLibrary";
import { SPEC_DATA_UPDATED_AT, SPEC_DATA_VERSION } from "./data/constants";
import { useComputed } from "./hooks/useComputed";
import { useSpecOverrides } from "./hooks/useSpecOverrides";
import { useItemSelection } from "./hooks/useItemSelection";
import { exportRankedCsv } from "./utils/exportCsv";

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
            onExportCsv={() => exportRankedCsv(ranked)}
          />

          <RankedItemsList ranked={ranked} selectedItem={selectedItem} onSelectItem={handleSelectItem} onSpecPress={openMobileSpecDetail} />
        </div>

        <EffectiveSpecLibrary effectiveRows={effectiveRows} />

        <MobileSpecDetailSheet detail={mobileSpecDetail} onClose={closeMobileSpecDetail} />

        <RankingFooter githubIssuesUrl={GITHUB_ISSUES_URL} />
      </div>
    </div>
  );
}
