import { Fragment, useMemo, useState } from "react";
import { Check, Clipboard, Pencil, Trash2 } from "lucide-react";
import { CLASS_COLORS, CLASS_LIBRARY, specIconUrl, specKey } from "../data/constants";
import {
  decodeRoster,
  encodeRoster,
  memberKey,
  normalizeRoster,
  roleForMember,
  titleCaseName,
} from "../utils/roster";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "./ui";

const BLANK_MEMBER = { name: "", className: "", mainSpec: "", offSpecs: [] };
const ROLE_GROUPS = [
  { key: "tank", label: "Tanks" },
  { key: "healer", label: "Healers" },
  { key: "dps", label: "DPS" },
];

export default function RosterPanel({ roster, setRoster, classOptions }) {
  const [draft, setDraft] = useState(BLANK_MEMBER);
  const [editing, setEditing] = useState(null);
  const [rosterString, setRosterString] = useState("");
  const [importExportStatus, setImportExportStatus] = useState(null);
  const [memberError, setMemberError] = useState("");

  const specs = draft.className ? Object.keys(CLASS_LIBRARY[draft.className].specs) : [];

  const groupedRoster = useMemo(
    () =>
      Object.fromEntries(
        ROLE_GROUPS.map(({ key }) => [
          key,
          roster
            .filter((member) => roleForMember(member) === key)
            .sort(
              (a, b) =>
                a.className.localeCompare(b.className) || a.name.localeCompare(b.name),
            ),
        ]),
      ),
    [roster],
  );

  const chooseClass = (className) => {
    setMemberError("");
    setDraft({ name: draft.name, className, mainSpec: "", offSpecs: [] });
  };

  const chooseMainSpec = (mainSpec) => {
    setMemberError("");
    setDraft({
      ...draft,
      mainSpec,
      offSpecs: draft.offSpecs.filter((spec) => spec !== mainSpec),
    });
  };

  const toggleOffSpec = (spec) => {
    setDraft({
      ...draft,
      offSpecs: draft.offSpecs.includes(spec)
        ? draft.offSpecs.filter((candidate) => candidate !== spec)
        : [...draft.offSpecs, spec],
    });
  };

  const saveMember = () => {
    const name = titleCaseName(draft.name.trim());
    if (!name || !draft.className || !draft.mainSpec) return;

    const member = { ...draft, name };
    const key = memberKey(member);
    const duplicate = roster.some(
      (current, index) => index !== editing && memberKey(current) === key,
    );

    if (duplicate) {
      setMemberError(`${name} already exists as a ${draft.className}.`);
      return;
    }

    setRoster((current) =>
      editing === null
        ? [...current, member]
        : current.map((existing, index) => (index === editing ? member : existing)),
    );
    setDraft(BLANK_MEMBER);
    setEditing(null);
    setMemberError("");
  };

  const editMember = (member) => {
    setMemberError("");
    setEditing(roster.indexOf(member));
    setDraft({ ...member, offSpecs: [...(member.offSpecs || [])] });
  };

  const exportRoster = async () => {
    try {
      const serialized = encodeRoster(roster);
      setRosterString(serialized);
      setImportExportStatus({ type: "success", message: "Roster encoded." });

      try {
        await navigator.clipboard?.writeText(serialized);
        setImportExportStatus({
          type: "success",
          message: "Roster encoded and copied to clipboard.",
        });
      } catch {
        // The encoded value remains available for manual copying.
      }
    } catch (error) {
      setImportExportStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not encode roster.",
      });
    }
  };

  const importRoster = () => {
    try {
      const imported = normalizeRoster(decodeRoster(rosterString));
      setRoster(imported);
      setDraft(BLANK_MEMBER);
      setEditing(null);
      setMemberError("");
      setRosterString(encodeRoster(imported));
      setImportExportStatus({
        type: "success",
        message: `Imported ${imported.length} roster member${imported.length === 1 ? "" : "s"}.`,
      });
    } catch (error) {
      setImportExportStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Invalid roster string.",
      });
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-zinc-50">Roster</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <h3 className="mb-3 font-semibold text-zinc-100">
            {editing === null ? "Add Roster Member" : "Update Roster Member"}
          </h3>

          <div className="flex flex-wrap items-end justify-center gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="shrink-0 font-medium text-zinc-200">Name:</span>
              <Input
                value={draft.name}
                onChange={(event) => {
                  setMemberError("");
                  setDraft({ ...draft, name: titleCaseName(event.target.value) });
                }}
                placeholder="Player name"
                className="w-64 bg-black border-zinc-700"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="shrink-0 font-medium text-zinc-200">Class:</span>
              <select
                value={draft.className}
                onChange={(event) => chooseClass(event.target.value)}
                className="w-56 rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
              >
                <option value="">Select class</option>
                {classOptions.map((className) => (
                  <option key={className}>{className}</option>
                ))}
              </select>
            </label>

            {draft.className && (
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="shrink-0 font-medium text-zinc-200">Main Spec:</span>
                <select
                  value={draft.mainSpec}
                  onChange={(event) => chooseMainSpec(event.target.value)}
                  className="w-56 rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
                >
                  <option value="">Select main spec</option>
                  {specs.map((spec) => (
                    <option key={spec}>{spec}</option>
                  ))}
                </select>
              </label>
            )}

            {draft.mainSpec && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                <span className="shrink-0 font-medium text-zinc-200">Offspecs:</span>
                {specs
                  .filter((spec) => spec !== draft.mainSpec)
                  .map((spec) => (
                    <label
                      key={spec}
                      className={`cursor-pointer rounded-xl border px-3 py-2 text-sm transition ${
                        draft.offSpecs.includes(spec)
                          ? "border-sky-500 bg-sky-950/60 text-sky-100"
                          : "border-zinc-700 bg-black text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={draft.offSpecs.includes(spec)}
                        onChange={() => toggleOffSpec(spec)}
                      />
                      {spec}
                    </label>
                  ))}
              </div>
            )}

            <Button
              onClick={saveMember}
              className="w-auto shrink-0 bg-sky-600 px-4 text-white hover:bg-sky-500"
            >
              {editing === null ? "Add Player" : "Update"}
            </Button>
          </div>

          {memberError && (
            <div className="mt-2 text-center text-xs text-red-400">{memberError}</div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <div className="mx-auto max-w-4xl text-center">
            <h3 className="font-semibold text-zinc-100">Import / Export Roster</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Export creates an encoded Lootmaster roster string. Import only accepts a valid
              encoded roster and rejects duplicate players.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={exportRoster}
                className="w-auto bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              >
                <Clipboard className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={importRoster}
                disabled={!rosterString.trim()}
                className="w-auto bg-sky-600 text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
            <Textarea
              value={rosterString}
              onChange={(event) => {
                setRosterString(event.target.value);
                setImportExportStatus(null);
              }}
              placeholder="LM1:..."
              className="mx-auto mt-3 min-h-24 max-w-4xl resize-y border-zinc-700 bg-black text-left font-mono text-xs text-zinc-100 placeholder:text-zinc-600"
            />
            {importExportStatus && (
              <div
                className={`mt-2 text-xs ${
                  importExportStatus.type === "error" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {importExportStatus.message}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
          {ROLE_GROUPS.map(({ key, label }) => (
            <Fragment key={key}>
              <div className="border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-300">
                {label}
                <span className="ml-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-normal">
                  {groupedRoster[key].length}
                </span>
              </div>

              {groupedRoster[key].map((member, index) => {
                const fullSpec = specKey(member.className, member.mainSpec);
                const iconUrl = specIconUrl(fullSpec);
                const tooltip = `Main: ${member.mainSpec}${
                  member.offSpecs?.length ? `\nOff-specs: ${member.offSpecs.join(", ")}` : ""
                }`;

                return (
                  <div
                    key={`${memberKey(member)}-${index}`}
                    className="flex items-center gap-3 border-b border-zinc-800 px-3 py-2 last:border-b-0 hover:bg-zinc-900/70"
                  >
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt=""
                        className="h-7 w-7 rounded border border-zinc-700"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded border border-zinc-700 bg-zinc-900" />
                    )}
                    <span
                      className="font-medium"
                      style={{ color: CLASS_COLORS[member.className] }}
                      title={tooltip}
                    >
                      {member.name}
                    </span>
                    <span className="text-xs text-zinc-500" title={tooltip}>
                      {member.mainSpec}
                    </span>
                    <div className="ml-auto flex items-center">
                      <button
                        title="Update member"
                        onClick={() => editMember(member)}
                        className="p-2 text-zinc-400 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Delete member"
                        onClick={() => setRoster((current) => current.filter((item) => item !== member))}
                        className="p-2 text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
