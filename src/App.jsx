import { Fragment, useEffect, useRef, useState } from "react";
import { ChevronDown, Download, ExternalLink, Search, X } from "lucide-react";
import TierText from "./components/TierText";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "./components/ui";
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

  const renderItemDetail = (row) => (
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
          <div className="space-y-6 bg-zinc-950/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 lg:sticky lg:top-0 lg:z-30">
            <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-100 border border-zinc-700">Default loot items: {defaultItemCount}</Badge>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-100 border border-zinc-700">Manual additions: {manualItemCount}</Badge>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-100 border border-zinc-700">Spec overrides: {overrideCount}</Badge>
                  <div className="ml-auto flex flex-wrap items-center gap-3">
                    <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => setShowManualItems((v) => !v)}>
                      {showManualItems ? "Hide" : "Show"} Manual Item Input
                    </Button>
                    <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => setShowSpecOverrides((v) => !v)}>
                      {showSpecOverrides ? "Hide" : "Show"} Spec Overrides
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showManualItems && (
              <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-zinc-50">Manual Item Input</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-300 mb-3">Optional. Add extra comma-separated items here. Format: <span className="text-zinc-100 font-mono">Name, Slot, Type, Stat1, Stat2</span> or <span className="text-zinc-100 font-mono">Name, Slot, Type, Primary, Stat1, Stat2</span></p>
                  <Textarea value={manualItemsText} onChange={(e) => setManualItemsText(e.target.value)} className="min-h-[180px] bg-black text-zinc-100 placeholder:text-zinc-500 border-zinc-700 font-mono text-sm leading-6" />
                </CardContent>
              </Card>
            )}

            {showSpecOverrides && (
              <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-zinc-50">Spec Overrides</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-300 mb-4">Default spec priorities are loaded automatically based on the current guidance from each spec's Wowhead guide and confirmed against their Class Discord. Use this editor only if you want to override a spec from the default set.</p>
                  <div className="grid grid-cols-1 xl:grid-cols-[280px,1fr] gap-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm text-zinc-300 block">Class</label>
                          <select value={selectedClass} onChange={(e) => handleSelectedClassChange(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black text-zinc-100 px-3 py-2">
                            {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-zinc-300 block">Spec</label>
                          <select value={selectedSpecName} onChange={(e) => handleSelectedSpecChange(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black text-zinc-100 px-3 py-2">
                            {specOptionsForClass.map((specName) => <option key={specName} value={specName}>{specName}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-400">Using {specOverrides[selectedSpec] ? "custom override" : "default values"} for this spec.</div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 xl:grid-cols-7 gap-2 items-end">
                        {[0,1,2,3].map((i) => (
                          <Fragment key={i}>
                            <div>
                              <label className="text-sm text-zinc-300 block mb-1">Stat {i + 1}</label>
                              <select value={draftOverride.stats[i]} onChange={(e) => updateSelectedSpec("stats", i, e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 sm:text-base">
                                {SPEC_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                              </select>
                            </div>
                            {i < 3 && (
                              <div>
                                <select value={draftOverride.comps[i]} onChange={(e) => updateSelectedSpec("comps", i, e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 sm:text-base">
                                  {COMPARATOR_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                                </select>
                              </div>
                            )}
                          </Fragment>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-sky-600 text-white hover:bg-sky-500" onClick={applySelectedSpecOverride}>Apply override</Button>
                        <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={resetSelectedSpec}>Reset selected spec to default</Button>
                        <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={resetAllSpecs}>Reset all overrides</Button>
                        <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={exportSpecOverrides}>Export overrides JSON</Button>
                        <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={() => importOverridesInputRef.current?.click()}>Import overrides JSON</Button>
                        <input
                          ref={importOverridesInputRef}
                          type="file"
                          accept="application/json,.json"
                          className="hidden"
                          onChange={importSpecOverridesFromFile}
                        />
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300">
                        Effective priority: <span className="text-zinc-100 font-mono">{selectedSpec}	{primaryStatForSpec(selectedSpec)} &gt;&gt; {draftOverride.stats[0]} {draftOverride.comps[0]} {draftOverride.stats[1]} {draftOverride.comps[1]} {draftOverride.stats[2]} {draftOverride.comps[2]} {draftOverride.stats[3]}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="text-zinc-50">Ranked Output</CardTitle>
                <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-end xl:w-auto xl:flex-nowrap">
                  <select
                    value={bossFilter}
                    onChange={(e) => setBossFilter(e.target.value)}
                    className="rounded-xl border border-zinc-700 bg-black text-zinc-100 px-3 py-2"
                  >
                    <option value="All bosses">All bosses</option>
                    {bossOptions.map((boss) => (
                      <option key={boss} value={boss}>{boss}</option>
                    ))}
                  </select>
                  <div className="relative flex-1 md:min-w-[16rem] xl:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter items..." className="pl-9 bg-black text-zinc-100 placeholder:text-zinc-500 border-zinc-700" />
                  </div>
                  <Button className="bg-sky-600 text-white hover:bg-sky-500 shrink-0" onClick={exportCsv}>
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>

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
                    onClick={() => handleSelectItem(row)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelectItem(row);
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
                        <TierText groups={row.s} item={row.item} onSpecPress={openMobileSpecDetail} />
                      </div>
                      <div>
                        <span className="text-zinc-400">A:</span>{" "}
                        <TierText groups={row.a} item={row.item} onSpecPress={openMobileSpecDetail} />
                      </div>
                      <div>
                        <span className="text-zinc-400">Trash:</span>{" "}
                        <TierText groups={row.trash} item={row.item} onSpecPress={openMobileSpecDetail} />
                      </div>
                    </div>
                  </div>

                  {selectedItem?.item.id === row.item.id && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                      {renderItemDetail(row)}
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
                      <tr className={`border-b border-zinc-800 cursor-pointer hover:bg-zinc-900/80 ${selectedItem?.item.id === row.item.id ? "bg-zinc-900/80" : ""}`} onClick={() => handleSelectItem(row)}>
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
                            {renderItemDetail(row)}
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

        {mobileSpecDetail && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 md:hidden" onClick={() => setMobileSpecDetail(null)}>
            <div className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="relative mb-3">
                <p style={{ color: mobileSpecDetail.specColor }} className="text-center font-semibold">{mobileSpecDetail.specFull}</p>
                <button
                  type="button"
                  onClick={() => setMobileSpecDetail(null)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-900"
                  aria-label="Close spec details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-zinc-300">
                <p><span className="text-zinc-400">Tier:</span> {mobileSpecDetail.tier} (Rank {mobileSpecDetail.rank})</p>
                <p><span className="text-zinc-400">Effective priority:</span> {mobileSpecDetail.priority}</p>
                <p><span className="text-zinc-400">Item secondaries:</span> {mobileSpecDetail.itemStats}</p>
                <p><span className="text-zinc-400">Why this position:</span> {mobileSpecDetail.reason}</p>
              </div>
            </div>
          </div>
        )}

        <footer className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-6 py-5 text-left shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-zinc-100">Feedback and ranking rules</p>
              <p className="max-w-3xl text-sm text-zinc-400">
                Report bad loot data, spec priority mistakes, or edge cases in the ranking logic directly on GitHub.
              </p>
              <a
                href={GITHUB_ISSUES_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 underline decoration-sky-400/50 underline-offset-4 transition hover:text-sky-200"
              >
                Open GitHub issues
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-5 border-t border-zinc-800 pt-5">
            <div className="max-w-4xl space-y-3 text-sm text-zinc-300">
              <p className="font-semibold text-zinc-100">How an item is ranked</p>
              <ol className="list-decimal space-y-2 pl-5 marker:text-zinc-500">
                <li>Trinkets are excluded from the ranked table. Manual items with invalid input are also skipped until their stats are fixed.</li>
                <li>A spec must be eligible to equip the item first. The app checks primary stat, armor type, and weapon compatibility before any ranking happens.</li>
                <li>The item's two secondary stats are compared against that spec's effective priority list, including any override you applied in the spec editor.</li>
                <li>If both item stats are tied inside the spec's top priority group, the result is S tier at rank 0.5.</li>
                <li>If the item contains both the spec's first and second priority stats, the result is S tier. Rank 1 means the larger stat budget is on the first-priority stat; rank 2 means it leans toward the second.</li>
                <li>If the item matches only the first-priority stat, it lands in A tier at rank 3. Matching only the second-priority stat lands in A tier at rank 4.</li>
                <li>If neither of the top two priority stats is present, the item is marked Trash. Within each tier, identical ranks are grouped with = and rank groups are ordered with &gt;.</li>
              </ol>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
