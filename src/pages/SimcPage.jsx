import { useEffect, useState } from "react";
import WowheadItem from "../components/WowheadItem";
import { parseSimcExport } from "../utils/parseSimcExport";
import { groupBonusRolls } from "../utils/groupBonusRolls";
import { resolveBonusRollPools } from "../utils/resolveBonusRollPools";

export default function SimcPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dataset, setDataset] = useState(null);
  const [dataError, setDataError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/data/encounter-loot.json").then((response) => {
      if (!response.ok) throw new Error("Encounter loot dataset unavailable");
      return response.json();
    }).then((data) => { if (active) setDataset(data); })
      .catch((err) => { if (active) setDataError(err.message); });
    return () => { active = false; };
  }, []);
  function analyze(event) {
    event.preventDefault();
    try { setResult(parseSimcExport(input)); setError(""); }
    catch (err) { setError(err.message); setResult(null); }
  }
  const groups = result ? resolveBonusRollPools(groupBonusRolls(result.rolls), dataset) : [];
  return <main className="min-h-screen bg-zinc-950 p-6 text-zinc-50">
    <div className="mx-auto max-w-5xl space-y-6">
      <header><h1 className="text-3xl font-bold">SimC Analyzer</h1>
        <p className="mt-2 text-zinc-400">Paste a SimulationCraft addon export to inspect recorded bonus-roll rewards.</p></header>
      <form onSubmit={analyze} className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <label htmlFor="simc-input" className="block font-medium">SimulationCraft Export</label>
        <textarea id="simc-input" value={input} onChange={(event) => setInput(event.target.value)}
          placeholder={'priest="Skelli"\n...\n# bonus_roll_items=...'} rows={7}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm text-zinc-100 focus:border-sky-500 focus:outline-none" />
        <button type="submit" className="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">Analyze SimC</button>
        {error && <p role="alert" className="text-rose-400">{error}</p>}
      </form>
      {result && <section className="space-y-5" aria-live="polite">
        <div className="rounded-xl border border-zinc-800 p-5">
          <h2 className="text-xl font-semibold">{result.character ?? "Unknown character"}</h2>
          <p className="text-zinc-400">{result.spec ?? "Unknown spec"} · {result.region ?? "?"}-{result.server ?? "?"}</p>
          <p className="mt-2 text-sm">{groups.length} loot pools · {result.rolls.length} recorded rewards</p>
          {Object.entries(result.currencies).map(([id, amount]) => <p key={id} className="text-sm text-zinc-400">Currency {id}: {amount} remaining</p>)}
        </div>
        {dataError && <p role="alert" className="text-amber-400">{dataError}</p>}
        {result.warnings.map((warning, i) => <p className="text-amber-400" key={i}>{warning}</p>)}
        {groups.length === 0 && <p className="text-zinc-400">No bonus-roll rewards were recorded in this export.</p>}
        {groups.map((pool) => <article key={pool.key} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h3 className="text-lg font-semibold">{pool.name ?? `Loot source ${pool.source}`}</h3>
          {pool.instanceName && <p className="text-sm text-zinc-400">{pool.instanceName} · {pool.difficultyName}</p>}
          <p className="mb-3 text-sm text-zinc-400">Spec {pool.specId} · Context {pool.context} · Reward key levels {pool.keyLevels?.join(', ') ?? pool.keyLevel} · {pool.rollCount} rolls</p>
          {pool.totalEligible != null ? <p className="mb-3 text-sm text-emerald-300">{pool.obtainedIds.length}/{pool.totalEligible} unique items collected · {pool.missingIds.length} remaining{pool.resolution === "item-inferred" ? " · Encounter inferred from rewards" : ""}</p> : <p className="mb-3 text-sm text-amber-300">Pool unresolved ({pool.resolution ?? "dataset loading"}) — completion cannot be calculated reliably.</p>}
          <ul className="space-y-2">{pool.rolls.map((roll, i) => <li key={i} className="rounded-lg bg-zinc-950 p-3 text-sm">
            <WowheadItem itemId={roll.itemId} /> <span className="ml-2 text-zinc-500">Key level {roll.keyLevel}</span>
          </li>)}</ul>
          {pool.missingIds?.length > 0 && <div className="mt-4"><h4 className="mb-2 font-semibold">Remaining eligible items</h4><ul className="space-y-2">{pool.missingIds.map((id) => <li key={id} className="rounded-lg bg-zinc-950 p-3 text-sm"><WowheadItem itemId={id} /></li>)}</ul></div>}
        </article>)}
      </section>}
    </div>
  </main>;
}
