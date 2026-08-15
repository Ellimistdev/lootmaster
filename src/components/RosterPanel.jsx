import { Fragment, useMemo, useState } from "react";
import { Check, Clipboard, Pencil, Trash2 } from "lucide-react";
import { CLASS_LIBRARY } from "../data/constants";
import { roleForMember } from "../hooks/useRoster";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "./ui";

const blank = { name: "", className: "", mainSpec: "", offSpecs: [] };
const ROSTER_SHARE_PREFIX = "LM1:";
const SPEC_ICON_BASE = "https://wow.zamimg.com/images/wow/icons/large";
const SPEC_ICONS = {
  "Death Knight - Blood": "spell_deathknight_bloodpresence.jpg", "Death Knight - Frost": "spell_deathknight_frostpresence.jpg", "Death Knight - Unholy": "spell_deathknight_unholypresence.jpg",
  "Demon Hunter - Devourer": "inv_ability_devourerdemonhunter_devour.jpg", "Demon Hunter - Havoc": "ability_demonhunter_specdps.jpg", "Demon Hunter - Vengeance": "ability_demonhunter_spectank.jpg",
  "Druid - Balance": "spell_nature_starfall.jpg", "Druid - Feral": "ability_druid_catform.jpg", "Druid - Guardian": "ability_racial_cannibalize.jpg", "Druid - Restoration": "spell_nature_healingtouch.jpg",
  "Evoker - Augmentation": "classicon_evoker_augmentation.jpg", "Evoker - Devastation": "classicon_evoker_devastation.jpg", "Evoker - Preservation": "classicon_evoker_preservation.jpg",
  "Hunter - Beast Mastery": "ability_hunter_bestialdiscipline.jpg", "Hunter - Marksmanship": "ability_hunter_focusedaim.jpg", "Hunter - Survival": "ability_hunter_camouflage.jpg",
  "Mage - Arcane": "spell_holy_magicalsentry.jpg", "Mage - Fire": "spell_fire_firebolt02.jpg", "Mage - Frost": "spell_frost_frostbolt02.jpg",
  "Monk - Brewmaster": "spell_monk_brewmaster_spec.jpg", "Monk - Mistweaver": "spell_monk_mistweaver_spec.jpg", "Monk - Windwalker": "spell_monk_windwalker_spec.jpg",
  "Paladin - Holy": "spell_holy_holybolt.jpg", "Paladin - Protection": "ability_paladin_shieldofthetemplar.jpg", "Paladin - Retribution": "spell_holy_auraoflight.jpg",
  "Priest - Discipline": "spell_holy_powerwordshield.jpg", "Priest - Holy": "spell_holy_guardianspirit.jpg", "Priest - Shadow": "spell_shadow_shadowwordpain.jpg",
  "Rogue - Assassination": "ability_rogue_deadlybrew.jpg", "Rogue - Outlaw": "ability_rogue_waylay.jpg", "Rogue - Subtlety": "ability_stealth.jpg",
  "Shaman - Elemental": "spell_nature_lightning.jpg", "Shaman - Enhancement": "spell_shaman_improvedreincarnation.jpg", "Shaman - Restoration": "spell_nature_magicimmunity.jpg",
  "Warlock - Affliction": "spell_shadow_deathcoil.jpg", "Warlock - Demonology": "spell_shadow_metamorphosis.jpg", "Warlock - Destruction": "spell_shadow_rainoffire.jpg",
  "Warrior - Arms": "ability_warrior_savageblow.jpg", "Warrior - Fury": "ability_warrior_innerrage.jpg", "Warrior - Protection": "ability_warrior_defensivestance.jpg",
};

const titleCaseName = (value) => value.toLocaleLowerCase().replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase());
const memberKey = (member) => `${member.className}::${member.name.trim().toLocaleLowerCase()}`;

function getCodec() {
  const codec = typeof window !== "undefined" ? window.LZString : null;
  if (!codec?.compressToEncodedURIComponent || !codec?.decompressFromEncodedURIComponent) throw new Error("Roster encoder is unavailable. Refresh the page and try again.");
  return codec;
}
function encodeRoster(roster) { return `${ROSTER_SHARE_PREFIX}${getCodec().compressToEncodedURIComponent(JSON.stringify(roster))}`; }
function decodeRoster(value) {
  const trimmed = value.trim();
  if (!trimmed.startsWith(ROSTER_SHARE_PREFIX)) throw new Error("Invalid roster string. Export a roster from Lootmaster and paste the complete encoded value.");
  const decoded = getCodec().decompressFromEncodedURIComponent(trimmed.slice(ROSTER_SHARE_PREFIX.length));
  if (!decoded) throw new Error("Roster string could not be decoded.");
  return JSON.parse(decoded);
}
function normalizeImportedRoster(value) {
  if (!Array.isArray(value)) throw new Error("Decoded roster must be an array.");
  const seen = new Set();
  return value.map((member, index) => {
    if (!member || typeof member !== "object") throw new Error(`Roster member ${index + 1} is invalid.`);
    const name = typeof member.name === "string" ? titleCaseName(member.name.trim()) : "";
    const className = member.className, mainSpec = member.mainSpec, classData = CLASS_LIBRARY[className];
    if (!name || !classData || !classData.specs[mainSpec]) throw new Error(`Roster member ${index + 1} has an invalid name, class, or main spec.`);
    const normalized = { name, className, mainSpec, offSpecs: [] }, key = memberKey(normalized);
    if (seen.has(key)) throw new Error(`Duplicate roster member: ${name} (${className}).`);
    seen.add(key);
    const validSpecs = new Set(Object.keys(classData.specs));
    normalized.offSpecs = Array.isArray(member.offSpecs) ? [...new Set(member.offSpecs.filter((spec) => validSpecs.has(spec) && spec !== mainSpec))] : [];
    return normalized;
  });
}

export default function RosterPanel({ roster, setRoster, classOptions }) {
  const [draft, setDraft] = useState(blank), [editing, setEditing] = useState(null), [rosterJson, setRosterJson] = useState(""), [jsonStatus, setJsonStatus] = useState(null), [memberError, setMemberError] = useState("");
  const specs = draft.className ? Object.keys(CLASS_LIBRARY[draft.className].specs) : [];
  const groups = useMemo(() => Object.fromEntries(["Tanks", "Healers", "DPS"].map((role) => [role, roster.filter((m) => roleForMember(m) === role).sort((a,b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name))])), [roster]);
  const chooseClass = (className) => { setMemberError(""); setDraft({ name: draft.name, className, mainSpec: "", offSpecs: [] }); };
  const chooseMain = (mainSpec) => { setMemberError(""); setDraft({ ...draft, mainSpec, offSpecs: draft.offSpecs.filter((s) => s !== mainSpec) }); };
  const toggleOff = (spec) => setDraft({ ...draft, offSpecs: draft.offSpecs.includes(spec) ? draft.offSpecs.filter((s) => s !== spec) : [...draft.offSpecs, spec] });
  const save = () => {
    const name = titleCaseName(draft.name.trim());
    if (!name || !draft.className || !draft.mainSpec) return;
    const member = { ...draft, name }, key = memberKey(member);
    if (roster.some((current, index) => index !== editing && memberKey(current) === key)) { setMemberError(`${name} already exists as a ${draft.className}.`); return; }
    setRoster((current) => editing === null ? [...current, member] : current.map((m, i) => i === editing ? member : m)); setDraft(blank); setEditing(null); setMemberError("");
  };
  const edit = (member) => { setMemberError(""); setEditing(roster.indexOf(member)); setDraft({ ...member, offSpecs: [...(member.offSpecs || [])] }); };
  const exportRoster = async () => { try { const serialized = encodeRoster(roster); setRosterJson(serialized); setJsonStatus({ type: "success", message: "Roster encoded." }); try { await navigator.clipboard?.writeText(serialized); setJsonStatus({ type: "success", message: "Roster encoded and copied to clipboard." }); } catch {} } catch (error) { setJsonStatus({ type: "error", message: error instanceof Error ? error.message : "Could not encode roster." }); } };
  const importRoster = () => { try { const imported = normalizeImportedRoster(decodeRoster(rosterJson)); setRoster(imported); setDraft(blank); setEditing(null); setMemberError(""); setRosterJson(encodeRoster(imported)); setJsonStatus({ type: "success", message: `Imported ${imported.length} roster member${imported.length === 1 ? "" : "s"}.` }); } catch (error) { setJsonStatus({ type: "error", message: error instanceof Error ? error.message : "Invalid roster string." }); } };

  return <Card className="bg-zinc-900 border-zinc-800 shadow-2xl"><CardHeader><CardTitle className="text-zinc-50">Roster</CardTitle></CardHeader><CardContent className="space-y-5">
    <div><h3 className="mb-3 font-semibold text-zinc-100">{editing === null ? "Add Roster Member" : "Update Roster Member"}</h3><div className="flex flex-wrap items-end justify-center gap-3">
      <label className="flex items-center gap-2 text-sm text-zinc-300"><span className="shrink-0 font-medium text-zinc-200">Name:</span><Input value={draft.name} onChange={(e) => { setMemberError(""); setDraft({ ...draft, name: titleCaseName(e.target.value) }); }} placeholder="Player name" className="w-64 bg-black border-zinc-700" /></label>
      <label className="flex items-center gap-2 text-sm text-zinc-300"><span className="shrink-0 font-medium text-zinc-200">Class:</span><select value={draft.className} onChange={(e) => chooseClass(e.target.value)} className="w-56 rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"><option value="">Select class</option>{classOptions.map((c) => <option key={c}>{c}</option>)}</select></label>
      {draft.className && <label className="flex items-center gap-2 text-sm text-zinc-300"><span className="shrink-0 font-medium text-zinc-200">Main Spec:</span><select value={draft.mainSpec} onChange={(e) => chooseMain(e.target.value)} className="w-56 rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"><option value="">Select main spec</option>{specs.map((s) => <option key={s}>{s}</option>)}</select></label>}
      {draft.mainSpec && <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300"><span className="shrink-0 font-medium text-zinc-200">Offspecs:</span>{specs.filter((s) => s !== draft.mainSpec).map((s) => <label key={s} className={`cursor-pointer rounded-xl border px-3 py-2 text-sm transition ${draft.offSpecs.includes(s) ? "border-sky-500 bg-sky-950/60 text-sky-100" : "border-zinc-700 bg-black text-zinc-300 hover:border-zinc-600"}`}><input type="checkbox" className="sr-only" checked={draft.offSpecs.includes(s)} onChange={() => toggleOff(s)} />{s}</label>)}</div>}
      <Button onClick={save} className="w-auto shrink-0 bg-sky-600 px-4 text-white hover:bg-sky-500">{editing === null ? "Add Player" : "Update"}</Button>
    </div>{memberError && <div className="mt-2 text-center text-xs text-red-400">{memberError}</div>}</div>
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"><div className="mx-auto max-w-4xl text-center"><h3 className="font-semibold text-zinc-100">Import / Export Roster</h3><p className="mt-1 text-xs text-zinc-400">Export creates an encoded Lootmaster roster string. Import only accepts a valid encoded roster and rejects duplicate players.</p><div className="mt-3 flex justify-center gap-2"><Button variant="secondary" onClick={exportRoster} className="w-auto bg-zinc-800 text-zinc-100 hover:bg-zinc-700"><Clipboard className="mr-2 h-4 w-4" />Export</Button><Button onClick={importRoster} disabled={!rosterJson.trim()} className="w-auto bg-sky-600 text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"><Check className="mr-2 h-4 w-4" />Import</Button></div><Textarea value={rosterJson} onChange={(e) => { setRosterJson(e.target.value); setJsonStatus(null); }} placeholder="LM1:..." className="mx-auto mt-3 min-h-24 max-w-4xl resize-y border-zinc-700 bg-black text-left font-mono text-xs text-zinc-100 placeholder:text-zinc-600" />{jsonStatus && <div className={`mt-2 text-xs ${jsonStatus.type === "error" ? "text-red-400" : "text-emerald-400"}`}>{jsonStatus.message}</div>}</div></div>
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black"><div>{["Tanks", "Healers", "DPS"].map((role) => <Fragment key={role}><div className="border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-semibold text-zinc-300">{role} <span className="ml-1 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs font-normal">{groups[role].length}</span></div>{groups[role].map((member, index) => { const fullSpec = `${member.className} - ${member.mainSpec}`, icon = SPEC_ICONS[fullSpec], tooltip = `Main: ${member.mainSpec}${member.offSpecs?.length ? `\nOff-specs: ${member.offSpecs.join(", ")}` : ""}`; return <div key={`${memberKey(member)}-${index}`} className="flex items-center gap-3 border-b border-zinc-800 px-3 py-2 last:border-b-0 hover:bg-zinc-900/70">{icon ? <img src={`${SPEC_ICON_BASE}/${icon}`} alt="" className="h-7 w-7 rounded border border-zinc-700" /> : <div className="h-7 w-7 rounded border border-zinc-700 bg-zinc-900" />}<span className="font-medium" style={{ color: CLASS_LIBRARY[member.className]?.color }} title={tooltip}>{member.name}</span><span className="text-xs text-zinc-500" title={tooltip}>{member.mainSpec}</span><div className="ml-auto flex items-center"><button title="Update member" onClick={() => edit(member)} className="p-2 text-zinc-400 hover:text-white"><Pencil className="h-4 w-4" /></button><button title="Delete member" onClick={() => setRoster((r) => r.filter((m) => m !== member))} className="p-2 text-zinc-400 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></div></div>; })}</Fragment>)}</div></div>
  </CardContent></Card>;
}
