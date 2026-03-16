import PageIntro from "./components/PageIntro";
import StickyControlsPanel from "./components/StickyControlsPanel";
import RankedItemsList from "./components/RankedItemsList";
import MobileSpecDetailSheet from "./components/MobileSpecDetailSheet";
import RankingFooter from "./components/RankingFooter";
import EffectiveSpecLibrary from "./components/EffectiveSpecLibrary";
import { SPEC_DATA_UPDATED_AT, SPEC_DATA_VERSION } from "./data/constants";
import { useLootRankingState } from "./hooks/useLootRankingState";
import { exportRankedCsv } from "./utils/exportCsv";

const GITHUB_ISSUES_URL = "https://github.com/Ellimistdev/lootmaster/issues";

export default function LootRankingApp() {
  const {
    manualItemsText,
    setManualItemsText,
    showManualItems,
    setShowManualItems,
    bossFilter,
    setBossFilter,
    query,
    setQuery,
    showSpecOverrides,
    setShowSpecOverrides,
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
    specOverrides,
    selectedItem,
    mobileSpecDetail,
    handleSelectItem,
    openMobileSpecDetail,
    closeMobileSpecDetail,
    ranked,
    defaultItemCount,
    manualItemCount,
    overrideCount,
    effectiveRows,
    bossOptions,
  } = useLootRankingState();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="w-full max-w-[1800px] mx-auto space-y-6">
        <PageIntro specDataVersion={SPEC_DATA_VERSION} specDataUpdatedAt={SPEC_DATA_UPDATED_AT} />

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

          <RankedItemsList
            ranked={ranked}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            onSpecPress={openMobileSpecDetail}
            bossFilter={bossFilter}
            onBossFilterChange={setBossFilter}
            bossOptions={bossOptions}
            query={query}
            onQueryChange={setQuery}
            onExportCsv={() => exportRankedCsv(ranked)}
          />
        </div>

        <EffectiveSpecLibrary effectiveRows={effectiveRows} />

        <MobileSpecDetailSheet detail={mobileSpecDetail} onClose={closeMobileSpecDetail} />

        <RankingFooter githubIssuesUrl={GITHUB_ISSUES_URL} />
      </div>
    </div>
  );
}
