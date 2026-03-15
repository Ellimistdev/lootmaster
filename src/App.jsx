import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui";
import StickyControlsPanel from "./components/StickyControlsPanel";
import RankedItemsList from "./components/RankedItemsList";
import MobileSpecDetailSheet from "./components/MobileSpecDetailSheet";
import RankingFooter from "./components/RankingFooter";
import { COMPARATOR_OPTIONS, DEFAULT_SPEC_ROWS, SPEC_DATA_UPDATED_AT, SPEC_DATA_VERSION, SPEC_OPTIONS } from "./data/constants";
import { useComputed } from "./hooks/useComputed";
import { defaultSpecMap, parseSpecOverridesJson, primaryStatForSpec, serializeSpecOverrides, titleStat } from "./utils/lootLogic";

const INITIAL_SELECTED_SPEC_FULL = DEFAULT_SPEC_ROWS[0][0];
const [INITIAL_SELECTED_CLASS, INITIAL_SELECTED_SPEC_NAME] = INITIAL_SELECTED_SPEC_FULL.split(" - ").map((x) => x.trim());
const SPEC_OVERRIDES_STORAGE_KEY = "midnight-lootmaster-spec-overrides-v1";
const GITHUB_ISSUES_URL = "https://github.com/Ellimistdev/lootmaster/issues";

function loadStoredSpecOverrides() {
  try {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(SPEC_OVERRIDES_STORAGE_KEY);
    if (!raw) return {};
    return parseSpecOverridesJson(raw);
  } catch {
    return {};
  }
}

export default function LootRankingApp() {
  const [manualItemsText, setManualItemsText] = useState("");
  const [showManualItems, setShowManualItems] = useState(false);
  const [showSpecOverrides, setShowSpecOverrides] = useState(false);
  const [specOverrides, setSpecOverrides] = useState(() => loadStoredSpecOverrides());
  const [selectedClass, setSelectedClass] = useState(INITIAL_SELECTED_CLASS);
  const [selectedSpecName, setSelectedSpecName] = useState(INITIAL_SELECTED_SPEC_NAME);
  const [draftOverride, setDraftOverride] = useState(defaultSpecMap()[INITIAL_SELECTED_SPEC_FULL]);
  const [bossFilter, setBossFilter] = useState("All bosses");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileSpecDetail, setMobileSpecDetail] = useState(null);
  const importOverridesInputRef = useRef(null);
  const { ranked, defaultItemCount, manualItemCount, overrideCount, effectiveRows, bossOptions } = useComputed(manualItemsText, specOverrides, query, bossFilter);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SPEC_OVERRIDES_STORAGE_KEY, serializeSpecOverrides(specOverrides));
  }, [specOverrides]);

  const classToSpecs = DEFAULT_SPEC_ROWS.reduce((acc, [full]) => {
    const [className, specName] = full.split(" - ").map((x) => x.trim());
    if (!acc[className]) acc[className] = [];
    acc[className].push(specName);
    return acc;
  }, {});

  const classOptions = Object.keys(classToSpecs).sort((a, b) => a.localeCompare(b));
  const specOptionsForClass = [...(classToSpecs[selectedClass] || [])].sort((a, b) => a.localeCompare(b));
  const selectedSpec = `${selectedClass} - ${selectedSpecName}`;

  const handleSelectedClassChange = (nextClass) => {
    const nextSpecName = ([...(classToSpecs[nextClass] || [])].sort((a, b) => a.localeCompare(b))[0]) || "";
    const nextSpec = `${nextClass} - ${nextSpecName}`;
    setSelectedClass(nextClass);
    setSelectedSpecName(nextSpecName);
    setDraftOverride(specOverrides[nextSpec] || defaultSpecMap()[nextSpec]);
  };

  const handleSelectedSpecChange = (nextSpecName) => {
    const nextSpec = `${selectedClass} - ${nextSpecName}`;
    setSelectedSpecName(nextSpecName);
    setDraftOverride(specOverrides[nextSpec] || defaultSpecMap()[nextSpec]);
  };

  const updateSelectedSpec = (field, index, value) => {
    setDraftOverride((prev) => {
      const next = { stats: [...prev.stats], comps: [...prev.comps] };
      next[field][index] = value;
      return next;
    });
  };

  const applySelectedSpecOverride = () => {
    const uniqueStats = new Set(draftOverride.stats);
    if (uniqueStats.size !== draftOverride.stats.length) {
      window.alert("Duplicate stats are not allowed in priority order. Please choose 4 unique stats.");
      return;
    }

    setSpecOverrides((prev) => ({ ...prev, [selectedSpec]: draftOverride }));
  };

  const resetSelectedSpec = () => {
    setSpecOverrides((prev) => {
      const next = { ...prev };
      delete next[selectedSpec];
      return next;
    });
    setDraftOverride(defaultSpecMap()[selectedSpec]);
  };

  const resetAllSpecs = () => {
    setSpecOverrides({});
    setDraftOverride(defaultSpecMap()[selectedSpec]);
  };

  const exportSpecOverrides = () => {
    const json = serializeSpecOverrides(specOverrides);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spec_overrides.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSpecOverridesFromFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseSpecOverridesJson(text);
      setSpecOverrides(imported);
      setDraftOverride(imported[selectedSpec] || defaultSpecMap()[selectedSpec]);
    } catch {
      window.alert("Could not import overrides. Please select a valid JSON file.");
    } finally {
      event.target.value = "";
    }
  };

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

  const handleSelectItem = (row) => {
    setSelectedItem((current) => (current?.item.id === row.item.id ? null : row));
  };

  const openMobileSpecDetail = (row, item) => {
    const itemStats = item?.stats?.length ? item.stats.map(titleStat).join("/") : "None";

    setMobileSpecDetail({
      specFull: row.spec.full,
      specColor: row.spec.color,
      priority: row.spec.priority,
      itemStats,
      reason: row.result.reason,
      tier: row.result.tier,
      rank: row.result.rank,
    });
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

        <MobileSpecDetailSheet detail={mobileSpecDetail} onClose={() => setMobileSpecDetail(null)} />

        <RankingFooter githubIssuesUrl={GITHUB_ISSUES_URL} />
      </div>
    </div>
  );
}
