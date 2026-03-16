import { ExternalLink } from "lucide-react";

export default function RankingFooter({ githubIssuesUrl }) {
  return (
    <footer className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-6 py-5 text-left shadow-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-zinc-100">Feedback and ranking rules</p>
          <p className="max-w-3xl text-sm text-zinc-400">
            Report bad loot data, spec priority mistakes, or edge cases in the ranking logic directly on GitHub.
          </p>
          <a
            href={githubIssuesUrl}
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
        <div className="space-y-3 text-sm text-zinc-300">
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
  );
}
