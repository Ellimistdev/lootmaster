import { useMemo, useState } from "react";
import { CLASS_LIBRARY, SPEC_REFERENCE_LINKS } from "../data/constants";
import { Card, CardContent, CardHeader, CardTitle } from "./ui";

function getSpecUpdatedAt(full) {
  const [className, specName] = full.split(" - ").map((part) => part.trim());
  return CLASS_LIBRARY[className]?.specs?.[specName]?.updatedAt || "Unknown";
}

function priorityText(parts) {
  return parts.join(" ");
}

function referenceText(full) {
  return (SPEC_REFERENCE_LINKS[full] || []).map((reference) => reference.label).join(", ");
}

export default function EffectiveSpecLibrary({ effectiveRows }) {
  const [sort, setSort] = useState({ key: "spec", direction: "asc" });

  const sortedRows = useMemo(() => {
    const rows = [...effectiveRows];
    const direction = sort.direction === "asc" ? 1 : -1;

    rows.sort((a, b) => {
      const [fullA, partsA] = a;
      const [fullB, partsB] = b;

      let valueA;
      let valueB;

      if (sort.key === "priority") {
        valueA = priorityText(partsA);
        valueB = priorityText(partsB);
      } else if (sort.key === "updatedAt") {
        valueA = getSpecUpdatedAt(fullA);
        valueB = getSpecUpdatedAt(fullB);
      } else if (sort.key === "references") {
        valueA = referenceText(fullA);
        valueB = referenceText(fullB);
      } else {
        valueA = fullA;
        valueB = fullB;
      }

      return valueA.localeCompare(valueB) * direction || fullA.localeCompare(fullB);
    });

    return rows;
  }, [effectiveRows, sort]);

  const handleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortIndicator = (key) => {
    if (sort.key !== key) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  };

  const headerButton = (key, label) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="inline-flex items-center justify-center gap-2 font-semibold hover:text-sky-300"
      aria-label={`Sort by ${label}`}
    >
      {label}
      <span className="text-xs text-zinc-500" aria-hidden="true">{sortIndicator(key)}</span>
    </button>
  );

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-zinc-50">Effective Spec Library</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[60vh] overflow-auto rounded-2xl border border-zinc-800 bg-black">
          <table className="w-full min-w-[960px] table-fixed text-sm">
            <thead className="bg-zinc-950 sticky top-0 z-10">
              <tr className="text-left border-b border-zinc-800 text-zinc-100">
                <th className="p-3 text-center w-[28%]" aria-sort={sort.key === "spec" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>{headerButton("spec", "Spec")}</th>
                <th className="p-3 text-center w-[30%]" aria-sort={sort.key === "priority" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>{headerButton("priority", "Priority")}</th>
                <th className="p-3 text-center w-[16%]" aria-sort={sort.key === "updatedAt" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>{headerButton("updatedAt", "Last Updated")}</th>
                <th className="p-3 text-center w-[26%]" aria-sort={sort.key === "references" ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>{headerButton("references", "Sources / References")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map(([full, parts]) => (
                <tr key={full} className="border-b border-zinc-800">
                  <td className="p-3 text-zinc-200">{full}</td>
                  <td className="p-3 text-zinc-100 font-mono">{priorityText(parts)}</td>
                  <td className="p-3 text-center text-zinc-400 whitespace-nowrap">{getSpecUpdatedAt(full)}</td>
                  <td className="p-3 text-center">
                    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                      {(SPEC_REFERENCE_LINKS[full] || []).map((reference) => (
                        <a
                          key={reference.label}
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:text-sky-300 hover:underline whitespace-nowrap"
                        >
                          {reference.label}
                        </a>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
