"use client";

import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

interface BudgetRow {
  category: string;
  budgeted: number;
  actual: number;
}

export default function BudgetPage() {
  const [rows, setRows] = useState<BudgetRow[]>([
    { category: "", budgeted: 0, actual: 0 },
  ]);
  const [result, setResult] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(i: number, field: keyof BudgetRow, value: string) {
    const next = [...rows];
    next[i] = { ...next[i], [field]: field === "category" ? value : Number(value) || 0 };
    setRows(next);
  }

  async function submit() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/cfa/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Budget vs Actual</h1>
      <div className="mb-4 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500" placeholder="Category" value={r.category} onChange={(e) => update(i, "category", e.target.value)} />
            <input className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" placeholder="Budgeted" value={r.budgeted || ""} onChange={(e) => update(i, "budgeted", e.target.value)} />
            <input className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" placeholder="Actual" value={r.actual || ""} onChange={(e) => update(i, "actual", e.target.value)} />
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setRows([...rows, { category: "", budgeted: 0, actual: 0 }])} className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">+ Add Row</button>
        <button onClick={submit} disabled={loading} className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700">{loading ? "Running…" : "Submit ▷"}</button>
      </div>
      {error && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{error}</div>}
      {result && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-zinc-800 text-zinc-400"><th className="px-3 py-2 font-medium uppercase">Category</th><th className="px-3 py-2 font-medium uppercase">Budgeted</th><th className="px-3 py-2 font-medium uppercase">Actual</th><th className="px-3 py-2 font-medium uppercase">Variance</th></tr></thead>
            <tbody>{result.map((row, i) => (
              <tr key={i} className="border-b border-zinc-800/50">
                <td className="px-3 py-2">{row.category as string}</td>
                <td className="px-3 py-2">${(row.budgeted as number).toFixed(2)}</td>
                <td className="px-3 py-2">${(row.actual as number).toFixed(2)}</td>
                <td className={`px-3 py-2 ${(row.variance as number) < 0 ? "text-red-400" : "text-emerald-400"}`}>${(row.variance as number).toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
