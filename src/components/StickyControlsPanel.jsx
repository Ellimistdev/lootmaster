import { Fragment } from "react";
import { Download, Search } from "lucide-react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "./ui";
import { COMPARATOR_OPTIONS, SPEC_OPTIONS } from "../data/constants";
import { primaryStatForSpec } from "../utils/lootLogic";

export default function StickyControlsPanel({
  defaultItemCount,
  manualItemCount,
  overrideCount,
  showManualItems,
  onToggleManualItems,
  showSpecOverrides,
  onToggleSpecOverrides,
  manualItemsText,
  onManualItemsTextChange,
  classOptions,
  specOptionsForClass,
  selectedClass,
  onSelectedClassChange,
  selectedSpecName,
  onSelectedSpecChange,
  selectedSpec,
  specOverrides,
  draftOverride,
  onUpdateSelectedSpec,
  onApplySelectedSpecOverride,
  onResetSelectedSpec,
  onResetAllSpecs,
  onExportSpecOverrides,
  onImportSpecOverridesClick,
  importOverridesInputRef,
  onImportSpecOverridesFromFile,
  
}) {
  return (
    <div className="space-y-6 bg-zinc-950/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-100 border border-zinc-700">Default loot items: {defaultItemCount}</Badge>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-100 border border-zinc-700">Manual additions: {manualItemCount}</Badge>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-100 border border-zinc-700">Spec overrides: {overrideCount}</Badge>
            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={onToggleManualItems}>
                {showManualItems ? "Hide" : "Show"} Manual Item Input
              </Button>
              <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={onToggleSpecOverrides}>
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
            <Textarea value={manualItemsText} onChange={(e) => onManualItemsTextChange(e.target.value)} className="min-h-[180px] bg-black text-zinc-100 placeholder:text-zinc-500 border-zinc-700 font-mono text-sm leading-6" />
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
                    <select value={selectedClass} onChange={(e) => onSelectedClassChange(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black text-zinc-100 px-3 py-2">
                      {classOptions.map((className) => <option key={className} value={className}>{className}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-300 block">Spec</label>
                    <select value={selectedSpecName} onChange={(e) => onSelectedSpecChange(e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black text-zinc-100 px-3 py-2">
                      {specOptionsForClass.map((specName) => <option key={specName} value={specName}>{specName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="text-xs text-zinc-400">Using {specOverrides[selectedSpec] ? "custom override" : "default values"} for this spec.</div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 xl:grid-cols-7 gap-2 items-end">
                  {[0, 1, 2, 3].map((i) => (
                    <Fragment key={i}>
                      <div>
                        <label className="text-sm text-zinc-300 block mb-1">Stat {i + 1}</label>
                        <select value={draftOverride.stats[i]} onChange={(e) => onUpdateSelectedSpec("stats", i, e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 sm:text-base">
                          {SPEC_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      {i < 3 && (
                        <div>
                          <select value={draftOverride.comps[i]} onChange={(e) => onUpdateSelectedSpec("comps", i, e.target.value)} className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 sm:text-base">
                            {COMPARATOR_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-sky-600 text-white hover:bg-sky-500" onClick={onApplySelectedSpecOverride}>Apply override</Button>
                  <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={onResetSelectedSpec}>Reset selected spec to default</Button>
                  <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={onResetAllSpecs}>Reset all overrides</Button>
                  <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={onExportSpecOverrides}>Export overrides JSON</Button>
                  <Button variant="secondary" className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700" onClick={onImportSpecOverridesClick}>Import overrides JSON</Button>
                  <input
                    ref={importOverridesInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={onImportSpecOverridesFromFile}
                  />
                </div>
                <div className="rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300">
                  Effective priority: <span className="text-zinc-100 font-mono">{selectedSpec} {primaryStatForSpec(selectedSpec)} &gt;&gt; {draftOverride.stats[0]} {draftOverride.comps[0]} {draftOverride.stats[1]} {draftOverride.comps[1]} {draftOverride.stats[2]} {draftOverride.comps[2]} {draftOverride.stats[3]}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranked Output controls moved into RankedItemsList to keep filters with the table */}
    </div>
  );
}
