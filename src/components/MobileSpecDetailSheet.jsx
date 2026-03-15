import { X } from "lucide-react";

export default function MobileSpecDetailSheet({ detail, onClose }) {
  if (!detail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70 p-3 md:hidden" onClick={onClose}>
      <div className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="relative mb-3">
          <p style={{ color: detail.specColor }} className="text-center font-semibold">{detail.specFull}</p>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-900"
            aria-label="Close spec details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 text-sm text-zinc-300">
          <p><span className="text-zinc-400">Tier:</span> {detail.tier} (Rank {detail.rank})</p>
          <p><span className="text-zinc-400">Effective priority:</span> {detail.priority}</p>
          <p><span className="text-zinc-400">Item secondaries:</span> {detail.itemStats}</p>
          <p><span className="text-zinc-400">Why this position:</span> {detail.reason}</p>
        </div>
      </div>
    </div>
  );
}
