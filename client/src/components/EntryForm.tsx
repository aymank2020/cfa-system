"use client";

import { useState } from "react";

interface Entry {
  account: string;
  debit: number;
  credit: number;
}

interface Props {
  title: string;
  endpoint: string;
  columns: string[];
  renderRow: (row: Record<string, unknown>, i: number) => React.ReactNode;
  extraFields?: React.ReactNode;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export default function EntryForm({ title, endpoint, columns, renderRow, extraFields }: Props) {
  const [entries, setEntries] = useState<Entry[]>([
    { account: "", debit: 0, credit: 0 },
  ]);
  const [result, setResult] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateEntry(i: number, field: keyof Entry, value: string) {
    const next = [...entries];
    next[i] = { ...next[i], [field]: field === "account" ? value : Number(value) || 0 };
    setEntries(next);
  }

  function addRow() {
    setEntries([...entries, { account: "", debit: 0, credit: 0 }]);
  }

  function removeRow(i: number) {
    if (entries.length > 1) setEntries(entries.filter((_, idx) => idx !== i));
  }

  async function submit() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entries),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setResult(Array.isArray(data) ? data : [data]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">{title}</h1>

      <div className="mb-4 space-y-2">
        {entries.map((e, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500"
              placeholder="Account name"
              value={e.account}
              onChange={(v) => updateEntry(i, "account", v.target.value)}
            />
            <input
              className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100"
              type="number"
              placeholder="Debit"
              value={e.debit || ""}
              onChange={(v) => updateEntry(i, "debit", v.target.value)}
            />
            <input
              className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100"
              type="number"
              placeholder="Credit"
              value={e.credit || ""}
              onChange={(v) => updateEntry(i, "credit", v.target.value)}
            />
            <button
              onClick={() => removeRow(i)}
              className="rounded p-1 text-zinc-500 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {extraFields}

      <div className="mb-4 flex gap-2">
        <button
          onClick={addRow}
          className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          + Add Row
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
        >
          {loading ? "Running…" : "Submit ▷"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {result && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400">
                {columns.map((c) => (
                  <th key={c} className="px-3 py-2 font-medium uppercase">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {renderRow(row, i)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
