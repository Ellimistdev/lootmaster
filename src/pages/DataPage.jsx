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
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-6xl text-left">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-sky-400">Lootmaster resources</p>
        <h1 className="mb-3 text-4xl font-bold text-white">Data catalog</h1>
        <p className="mb-10 max-w-3xl text-base leading-relaxed text-zinc-400">
          Public, versioned game data used by Lootmaster and available for other tools. Published datasets are served as static JSON files; no API key is required.
        </p>
        <section aria-labelledby="published-heading" className="mb-12">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 id="published-heading" className="text-2xl font-semibold text-white">Available datasets</h2>
            <span className="text-sm text-zinc-500">{published.length}</span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {published.map((dataset) => <DatasetCard key={dataset.id} dataset={dataset} />)}
          </div>
          {metadata && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
              <span className="font-medium text-zinc-200">Encounter loot build:</span>{" "}
              {metadata.game?.version || "Unknown"}{metadata.game?.build ? " (" + metadata.game.build + ")" : ""}
              {metadata.harvest?.status ? " · Harvest " + metadata.harvest.status : ""}
            </div>
          )}
        </section>
        <section aria-labelledby="harvest-heading" className="mb-12">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 id="harvest-heading" className="text-2xl font-semibold text-white">Harvest datasets</h2>
          </div>
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-zinc-400">
            Download the complete seasonal dataset above, or use the shared specialization reference
            and individual instance exports below. All files are public static JSON.
          </p>
          <div className="mb-8 grid gap-5 md:grid-cols-2">
            <DatasetCard dataset={{
              id: "specializations",
              title: "Specialization Reference",
              description: "Shared specialization IDs and metadata used across every harvested instance.",
              category: "Reference data",
              status: "published",
              format: "JSON",
              url: "/data/specializations.json",
              sourceUrl: "https://github.com/Ellimistdev/lootmaster/blob/master/data/harvests/specializations.json",
            }} />
          </div>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">Individual instances</h3>
            <span className="text-sm text-zinc-500">{instances.length}</span>
          </div>
          {instances.length ? (
            <div className="grid gap-5 md:grid-cols-2">
              {instances.map((instance) => (
                <DatasetCard key={instance.instanceId} dataset={{
                  id: String(instance.instanceId),
                  title: instance.name,
                  description: `Encounter Journal harvest for instance ${instance.instanceId} · ${instance.jobs} jobs`,
                  category: instance.instanceType === "dungeon" ? "Dungeon" : instance.instanceType === "raid" ? "Raid" : "Instance",
                  status: "published",
                  format: "JSON",
                  url: instance.url,
                  sourceUrl: "https://github.com/Ellimistdev/lootmaster/tree/master/data/harvests/instances",
                }} />
              ))}
            </div>
          ) : <p className="text-sm text-zinc-500">No individual instance exports available.</p>}
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
