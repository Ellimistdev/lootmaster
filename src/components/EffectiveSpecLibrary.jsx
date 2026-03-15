import { Card, CardContent, CardHeader, CardTitle } from "./ui";

export default function EffectiveSpecLibrary({ effectiveRows }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
      <CardHeader>
        <CardTitle className="text-zinc-50">Effective Spec Library</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 overflow-auto rounded-2xl border border-zinc-800 bg-black">
          <table className="w-full text-sm">
            <thead className="bg-zinc-950 sticky top-0 z-10">
              <tr className="text-left border-b border-zinc-800 text-zinc-100">
                <th className="p-3">Spec</th>
                <th className="p-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {effectiveRows.map(([full, parts]) => (
                <tr key={full} className="border-b border-zinc-800">
                  <td className="p-3 text-zinc-200">{full}</td>
                  <td className="p-3 text-zinc-100 font-mono">{parts[0]} {parts[1]} {parts[2]} {parts[3]} {parts[4]} {parts[5]} {parts[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
