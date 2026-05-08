"use client";

import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export default function PayrollPage() {
  const [form, setForm] = useState({ hours_worked: 160, hourly_rate: 50, tax_rate: 20, deductions: 500 });
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/cfa/payroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "hours_worked", label: "Hours Worked" },
    { key: "hourly_rate", label: "Hourly Rate ($)" },
    { key: "tax_rate", label: "Tax Rate (%)" },
    { key: "deductions", label: "Deductions ($)" },
  ];

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Payroll Calculator</h1>
      <div className="mb-4 grid max-w-md gap-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs text-zinc-400">{f.label}</label>
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100"
              type="number"
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) || 0 })}
            />
          </div>
        ))}
      </div>
      <button
        onClick={submit} disabled={loading}
        className="mb-4 w-fit rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700"
      >
        {loading ? "Calculating…" : "Calculate ▷"}
      </button>
      {error && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{error}</div>}
      {result && (
        <div className="max-w-md space-y-2">
          {Object.entries(result).map(([k, v]) => (
            <div key={k} className="flex justify-between rounded border border-zinc-800 px-4 py-2 text-sm">
              <span className="text-zinc-400">{k.replace(/_/g, " ")}</span>
              <span className="font-mono">${Number(v).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
