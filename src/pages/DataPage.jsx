import { useEffect, useState } from "react";
import { dataCatalog } from "../data/dataCatalog";

function DatasetCard({ dataset }) {
  const published = dataset.status === "published";
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">{dataset.category}</span>
        <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">{dataset.format}</span>
        <span className={published ? "rounded bg-emerald-950 px-2 py-1 text-emerald-300" : "rounded bg-zinc-800 px-2 py-1 text-zinc-400"}>
          {published ? "Published" : "Planned"}
        </span>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-white">{dataset.title}</h2>
      <p className="mb-5 text-sm leading-relaxed text-zinc-400">{dataset.description}</p>
      {published ? (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a className="font-medium text-sky-400 hover:text-sky-300" href={dataset.url} target="_blank" rel="noreferrer">View JSON ↗</a>
          <a className="text-zinc-300 hover:text-white" href={dataset.url} download>Download</a>
          {dataset.sourceUrl && <a className="text-zinc-400 hover:text-white" href={dataset.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>}
        </div>
      ) : <p className="text-sm text-zinc-500">Not yet available</p>}
    </article>
  );
}

export default function DataPage() {
  const [metadata, setMetadata] = useState(null);
  const [instances, setInstances] = useState([]);
  useEffect(() => {
    let active = true;
    fetch("/data/instances.json")
      .then((response) => { if (!response.ok) throw new Error("Not available"); return response.json(); })
      .then((data) => { if (active && Array.isArray(data)) setInstances(data); })
      .catch(() => { if (active) setInstances([]); });
    fetch("/data/encounter-loot.json")
      .then((response) => { if (!response.ok) throw new Error("Not available"); return response.json(); })
      .then((data) => { if (active) setMetadata(data); })
      .catch(() => { if (active) setMetadata(null); });
    return () => { active = false; };
  }, []);
  const published = dataCatalog.filter((dataset) => dataset.status === "published");
  const planned = dataCatalog.filter((dataset) => dataset.status !== "published");
  const raids = instances.filter((instance) => instance.instanceType === "raid");
  const dungeons = instances.filter((instance) => instance.instanceType === "dungeon");
  const seasonal = [
    { id: "specs", title: "Specs", description: "Shared specialization reference metadata.", category: "Reference", url: "/data/specializations.json" },
    { ...published[0], title: "All Season 2", description: "All harvested Season 2 raid and dungeon loot.", category: "Seasonal" },
    { id: "season-raids", title: "All Season 2 Raids", description: "Combined raid encounters and their eligible items.", category: "Seasonal", url: "/data/season-2-raids.json" },
    { id: "season-dungeons", title: "All Season 2 Dungeons", description: "Combined dungeon encounters and their eligible items.", category: "Seasonal", url: "/data/season-2-dungeons.json" },
    ...raids.map((instance) => ({
      id: "instance-" + instance.instanceId, title: instance.name,
      description: `Raid · ${instance.jobs} jobs`, category: "Raid", url: instance.url,
    })),
    ...dungeons.map((instance) => ({
      id: "instance-" + instance.instanceId, title: instance.name,
      description: `Dungeon · ${instance.jobs} jobs`, category: "Dungeon", url: instance.url,
    })),
  ];
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-6xl text-left">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-400">Lootmaster resources</p>
        <h1 className="mb-3 text-4xl font-bold text-white">Data catalog</h1>
        <p className="mb-10 max-w-3xl text-base leading-relaxed text-zinc-400">
          Public, versioned game data used by Lootmaster and available for other tools. Published datasets are served as static JSON files; no API key is required.
        </p>
        <section aria-labelledby="published-heading" className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 id="published-heading" className="text-2xl font-semibold text-white">Available datasets</h2>
            <span className="text-sm text-zinc-500">{seasonal.length}</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
            {seasonal.map((dataset, index) => (
              <div key={dataset.id}>
                {dungeons.length > 0 && index === 4 + raids.length && (
                  <div className="border-b border-zinc-800 bg-zinc-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Individual Dungeons
                  </div>
                )}
                <div className="flex flex-col gap-2 border-b border-zinc-800 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-zinc-100">{dataset.title}</h3>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{dataset.category}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{dataset.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-4 text-sm">
                    <a className="font-medium text-sky-400 hover:text-sky-300" href={dataset.url} target="_blank" rel="noreferrer">View JSON ↗</a>
                    <a className="text-zinc-300 hover:text-white" href={dataset.url} download>Download</a>
                    <a className="text-zinc-400 hover:text-white" href="https://github.com/Ellimistdev/lootmaster/tree/master/data/harvests" target="_blank" rel="noreferrer">Source ↗</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {metadata && (
            <p className="mt-3 text-sm text-zinc-500">
              Encounter loot build: {metadata.game?.version || "Unknown"}
              {metadata.game?.build ? " (" + metadata.game.build + ")" : ""}
              {metadata.harvest?.status ? " · Harvest " + metadata.harvest.status : ""}
            </p>
          )}
        </section>
        <section aria-labelledby="planned-heading">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 id="planned-heading" className="text-2xl font-semibold text-white">Planned datasets</h2>
            <span className="text-sm text-zinc-500">{planned.length}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {planned.map((dataset) => <DatasetCard key={dataset.id} dataset={dataset} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
