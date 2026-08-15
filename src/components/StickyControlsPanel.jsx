import { Fragment } from "react";
import { COMPARATOR_OPTIONS, SPEC_OPTIONS } from "../data/constants";
import { primaryStatForSpec } from "../utils/lootLogic";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from "./ui";

export default function StickyControlsPanel({
  defaultItemCount,
  manualItemCount,
  overrideCount,
  rosterCount,
  showRoster,
  onToggleRoster,
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
      <Card className="border-zinc-800 bg-zinc-900 shadow-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
            <Badge
              variant="secondary"
              className="border border-zinc-700 bg-zinc-800 text-zinc-100"
            >
              Default loot items: {defaultItemCount}
            </Badge>
            <Badge
              variant="secondary"
              className="border border-zinc-700 bg-zinc-800 text-zinc-100"
            >
              Manual additions: {manualItemCount}
            </Badge>
            <Badge
              variant="secondary"
              className="border border-zinc-700 bg-zinc-800 text-zinc-100"
            >
              Spec overrides: {overrideCount}
            </Badge>
            <Badge
              variant="secondary"
              className="border border-zinc-700 bg-zinc-800 text-zinc-100"
            >
              Roster: {rosterCount}
            </Badge>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                onClick={onToggleRoster}
              >
                {showRoster ? "Hide" : "Show"} Roster
              </Button>
              <Button
                variant="secondary"
                className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                onClick={onToggleManualItems}
              >
                {showManualItems ? "Hide" : "Show"} Manual Item Input
              </Button>
              <Button
                variant="secondary"
                className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                onClick={onToggleSpecOverrides}
              >
                {showSpecOverrides ? "Hide" : "Show"} Spec Overrides
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showManualItems && (
        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-zinc-50">Manual Item Input</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-zinc-300">
              Optional. Add extra comma-separated items here. Format:{" "}
              <span className="font-mono text-zinc-100">Name, Slot, Type, Stat1, Stat2</span>{" "}
              or{" "}
              <span className="font-mono text-zinc-100">
                Name, Slot, Type, Primary, Stat1, Stat2
              </span>
            </p>
            <Textarea
              value={manualItemsText}
              onChange={(event) => onManualItemsTextChange(event.target.value)}
              className="min-h-[180px] border-zinc-700 bg-black font-mono text-sm leading-6 text-zinc-100 placeholder:text-zinc-500"
            />
          </CardContent>
        </Card>
      )}

      {showSpecOverrides && (
        <Card className="border-zinc-800 bg-zinc-900 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-zinc-50">Spec Overrides</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-zinc-300">
              Default spec priorities are loaded automatically based on the current guidance from
              each spec&apos;s Wowhead guide and confirmed against their Class Discord. Use this
              editor only if you want to override a spec from the default set.
            </p>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px,1fr]">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm text-zinc-300">Class</label>
                    <select
                      value={selectedClass}
                      onChange={(event) => onSelectedClassChange(event.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
                    >
                      {classOptions.map((className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300">Spec</label>
                    <select
                      value={selectedSpecName}
                      onChange={(event) => onSelectedSpecChange(event.target.value)}
                      className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
                    >
                      {specOptionsForClass.map((specName) => (
                        <option key={specName} value={specName}>
                          {specName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-xs text-zinc-400">
                  Using {specOverrides[selectedSpec] ? "custom override" : "default values"} for
                  this spec.
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 items-end gap-2 xl:grid-cols-7">
                  {[0, 1, 2, 3].map((index) => (
                    <Fragment key={index}>
                      <div>
                        <label className="mb-1 block text-sm text-zinc-300">
                          Stat {index + 1}
                        </label>
                        <select
                          value={draftOverride.stats[index]}
                          onChange={(event) =>
                            onUpdateSelectedSpec("stats", index, event.target.value)
                          }
                          className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 sm:text-base"
                        >
                          {SPEC_OPTIONS.map((stat) => (
                            <option key={stat}>{stat}</option>
                          ))}
                        </select>
                      </div>

                      {index < 3 && (
                        <div>
                          <select
                            value={draftOverride.comps[index]}
                            onChange={(event) =>
                              onUpdateSelectedSpec("comps", index, event.target.value)
                            }
                            className="w-full rounded-xl border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 sm:text-base"
                          >
                            {COMPARATOR_OPTIONS.map((comparator) => (
                              <option key={comparator}>{comparator}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    className="bg-sky-600 text-white hover:bg-sky-500"
                    onClick={onApplySelectedSpecOverride}
                  >
                    Apply override
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                    onClick={onResetSelectedSpec}
                  >
                    Reset selected spec to default
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                    onClick={onResetAllSpecs}
                  >
                    Reset all overrides
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                    onClick={onExportSpecOverrides}
                  >
                    Export overrides JSON
                  </Button>
                  <Button
                    variant="secondary"
                    className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                    onClick={onImportSpecOverridesClick}
                  >
                    Import overrides JSON
                  </Button>
                  <input
                    ref={importOverridesInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={onImportSpecOverridesFromFile}
                  />
                </div>

                <div className="rounded-xl border border-zinc-800 bg-black px-3 py-3 text-sm text-zinc-300">
                  Effective priority:{" "}
                  <span className="font-mono text-zinc-100">
                    {selectedSpec} {primaryStatForSpec(selectedSpec)} &gt;&gt; {draftOverride.stats[0]}{" "}
                    {draftOverride.comps[0]} {draftOverride.stats[1]} {draftOverride.comps[1]}{" "}
                    {draftOverride.stats[2]} {draftOverride.comps[2]} {draftOverride.stats[3]}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
