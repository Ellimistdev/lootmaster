import { useEffect, useState } from "react";
import PageIntro from "./components/PageIntro";
import StickyControlsPanel from "./components/StickyControlsPanel";
import RankedItemsList from "./components/RankedItemsList";
import RosterPanel from "./components/RosterPanel";
import MobileSpecDetailSheet from "./components/MobileSpecDetailSheet";
import RankingFooter from "./components/RankingFooter";
import EffectiveSpecLibrary from "./components/EffectiveSpecLibrary";
import { SPEC_DATA_UPDATED_AT, SPEC_DATA_VERSION } from "./data/constants";
import { useLootRankingState } from "./hooks/useLootRankingState";
import { useRoster } from "./hooks/useRoster";
import { exportRankedCsv } from "./utils/exportCsv";

const GITHUB_ISSUES_URL = "https://github.com/Ellimistdev/lootmaster/issues";
const ANALYTICS_CONSENT_KEY = "lootmaster_analytics_consent";
function updateAnalyticsConsent(isGranted) { if (typeof window === "undefined" || typeof window.gtag !== "function") return; window.gtag("consent", "update", { ad_storage: isGranted ? "granted" : "denied", analytics_storage: isGranted ? "granted" : "denied", ad_user_data: isGranted ? "granted" : "denied", ad_personalization: isGranted ? "granted" : "denied" }); }

export default function LootRankingApp() {
  const [consentChoice, setConsentChoice] = useState(() => typeof window === "undefined" ? null : window.localStorage.getItem(ANALYTICS_CONSENT_KEY));
  const showConsentBanner = consentChoice !== "granted" && consentChoice !== "denied";
  useEffect(() => { if (consentChoice === "granted") updateAnalyticsConsent(true); else if (consentChoice === "denied") updateAnalyticsConsent(false); }, [consentChoice]);
  const setConsent = (value) => { updateAnalyticsConsent(value === "granted"); window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value); setConsentChoice(value); };
  const state = useLootRankingState();
  const rosterState = useRoster();

  return <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6"><div className="w-full max-w-[1800px] mx-auto space-y-6">
    <PageIntro specDataVersion={SPEC_DATA_VERSION} specDataUpdatedAt={SPEC_DATA_UPDATED_AT} />
    <div className="space-y-6">
      <StickyControlsPanel {...state} onToggleManualItems={() => state.setShowManualItems(v => !v)} onToggleSpecOverrides={() => state.setShowSpecOverrides(v => !v)} onToggleRoster={() => rosterState.setShowRoster(v => !v)} showRoster={rosterState.showRoster} rosterCount={rosterState.roster.length} onManualItemsTextChange={state.setManualItemsText} onSelectedClassChange={state.handleSelectedClassChange} onSelectedSpecChange={state.handleSelectedSpecChange} onUpdateSelectedSpec={state.updateSelectedSpec} onApplySelectedSpecOverride={state.applySelectedSpecOverride} onResetSelectedSpec={state.resetSelectedSpec} onResetAllSpecs={state.resetAllSpecs} onExportSpecOverrides={state.exportSpecOverrides} onImportSpecOverridesClick={() => state.importOverridesInputRef.current?.click()} onImportSpecOverridesFromFile={state.importSpecOverridesFromFile} />
      {rosterState.showRoster && <RosterPanel roster={rosterState.roster} setRoster={rosterState.setRoster} classOptions={rosterState.rosterClassOptions} />}
      <RankedItemsList ranked={state.ranked} selectedItem={state.selectedItem} onSelectItem={state.handleSelectItem} onSpecPress={state.openMobileSpecDetail} bossFilter={state.bossFilter} onBossFilterChange={state.setBossFilter} bossOptions={state.bossOptions} query={state.query} onQueryChange={state.setQuery} onExportCsv={() => exportRankedCsv(state.ranked)} playerNamesBySpec={rosterState.playerNamesBySpec} />
    </div>
    <EffectiveSpecLibrary effectiveRows={state.effectiveRows} />
    <MobileSpecDetailSheet detail={state.mobileSpecDetail} onClose={state.closeMobileSpecDetail} />
    <RankingFooter githubIssuesUrl={GITHUB_ISSUES_URL} />
    {showConsentBanner && <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur md:left-auto md:max-w-xl"><p className="text-sm text-zinc-200">We use Google Analytics to measure traffic and site usage. You can accept or reject analytics cookies.</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => setConsent("granted")} className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500">Accept analytics</button><button onClick={() => setConsent("denied")} className="rounded-xl border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700">Reject analytics</button></div></div>}
  </div></div>;
}
