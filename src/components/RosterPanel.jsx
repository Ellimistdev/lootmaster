import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { CLASS_LIBRARY } from "../data/constants";
import { roleForMember } from "../hooks/useRoster";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "./ui";

const blank = { name: "", className: "", mainSpec: "", offSpecs: [] };

export default function RosterPanel({ roster, setRoster, classOptions }) {
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(null);
  const specs = draft.className ? Object.keys(CLASS_LIBRARY[draft.className].specs) : [];
  const groups = useMemo(() => Object.fromEntries(["Tanks", "Healers", "DPS"].map((role) => [role, roster.filter((m) => roleForMember(m) === role).sort((a,b) => a.className.localeCompare(b.className) || a.name.localeCompare(b.name))])), [roster]);

  const chooseClass = (className) => setDraft({ name: draft.name, className, mainSpec: "", offSpecs: [] });
  const chooseMain = (mainSpec) => setDraft({ ...draft, mainSpec, offSpecs: draft.offSpecs.filter((s) => s !== mainSpec) });
  const toggleOff = (spec) => setDraft({ ...draft, offSpecs: draft.offSpecs.includes(spec) ? draft.offSpecs.filter((s) => s !== spec) : [...draft.offSpecs, spec] });
  const save = () => {
    if (!draft.name.trim() || !draft.className || !draft.mainSpec) return;
    const member = { ...draft, name: draft.name.trim() };
    setRoster((current) => editing === null ? [...current, member] : current.map((m, i) => i === editing ? member : m));
    setDraft(blank); setEditing(null);
  };
  const edit = (member) => { setEditing(roster.indexOf(member)); setDraft({ ...member, offSpecs: [...(member.offSpecs || [])] }); };

  return <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
    <CardHeader><CardTitle className="text-zinc-50">Roster</CardTitle></CardHeader>
    <CardContent className="space-y-5">
      <div>
        <h3 className="mb-3 font-semibold text-zinc-100">{editing === null ? "Add Roster Member" : "Update Roster Member"}</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Name" className="bg-black border-zinc-700" />
          <select value={draft.className} onChange={(e) => chooseClass(e.target.value)} className="rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"><option value="">Class</option>{classOptions.map((c) => <option key={c}>{c}</option>)}</select>
          {draft.className && <select value={draft.mainSpec} onChange={(e) => chooseMain(e.target.value)} className="rounded-xl border border-zinc-700 bg-black px-3 py-2 text-zinc-100"><option value="">Main spec</option>{specs.map((s) => <option key={s}>{s}</option>)}</select>}
          <Button onClick={save} className="bg-sky-600 text-white hover:bg-sky-500">{editing === null ? "Add Player" : "Update"}</Button>
        </div>
        {draft.mainSpec && <div className="mt-3 flex flex-wrap gap-4 text-sm text-zinc-300">{specs.filter((s) => s !== draft.mainSpec).map((s) => <label key={s} className="flex items-center gap-2"><input type="checkbox" checked={draft.offSpecs.includes(s)} onChange={() => toggleOff(s)} /> {s}</label>)}</div>}
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <table className="w-full text-sm"><tbody>{["Tanks", "Healers", "DPS"].map((role) => <>{<tr key={`${role}-head`} className="bg-zinc-950"><th colSpan="3" className="px-3 py-2 text-left text-zinc-300">{role}</th></tr>}{groups[role].map((member) => <tr key={`${member.className}-${member.name}`} className="border-t border-zinc-800"><td className="px-3 py-2" title={`Main: ${member.mainSpec}${member.offSpecs?.length ? `\nOff-specs: ${member.offSpecs.join(", ")}` : ""}`}>{member.name}</td><td className="px-3 py-2 text-zinc-300">{member.className} — {[member.mainSpec, ...(member.offSpecs || [])].join(", ")}</td><td className="px-3 py-2 text-right"><button title="Update member" onClick={() => edit(member)} className="p-2 text-zinc-300 hover:text-white"><Pencil className="h-4 w-4" /></button><button title="Delete member" onClick={() => setRoster((r) => r.filter((m) => m !== member))} className="p-2 text-zinc-300 hover:text-red-400"><Trash2 className="h-4 w-4" /></button></td></tr>)}</>)}</tbody></table>
      </div>
    </CardContent>
  </Card>;
}
