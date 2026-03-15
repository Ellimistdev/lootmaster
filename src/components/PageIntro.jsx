export default function PageIntro({ specDataVersion, specDataUpdatedAt }) {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight text-zinc-50">Midnight Loot Master</h1>
      <p className="text-zinc-300 mt-2">Loaded with the Season 1 raid loot table. Manual item input is optional if you want to add one-off entries.</p>
      <p className="text-zinc-400 text-sm mt-2">Spec data: {specDataVersion} • Updated: {specDataUpdatedAt}</p>
      <p className="text-amber-400/80 text-sm mt-2">
        ⚠ This tool ranks specs by <strong>secondary stat priorities only</strong> - trinkets are excluded from the table.
      </p>
      <p className="text-amber-400/80 text-sm mt-2">
        For trinket rankings visit {" "}
        <a href="https://bloodmallet.com/chart/trinket_compare" target="_blank" rel="noreferrer" className="underline hover:text-amber-300">bloodmallet</a>
        {" "}or{" "}
        <a href="https://questionablyepic.com/live/trinkets" target="_blank" rel="noreferrer" className="underline hover:text-amber-300">Questionably Epic</a>
        {" "}(healers).
      </p>
    </div>
  );
}
