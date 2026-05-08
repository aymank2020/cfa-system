"use client";

import { useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

const defaults = { current_assets: 200000, current_liabilities: 100000, total_debt: 300000, total_equity: 500000, net_income: 80000, total_assets: 1000000 };

const labels: Record<string, string> = {
  current_assets: "Current Assets ($)", current_liabilities: "Current Liabilities ($)",
  total_debt: "Total Debt ($)", total_equity: "Total Equity ($)",
  net_income: "Net Income ($)", total_assets: "Total Assets ($)",
};

export default function FinancialRatiosPage() {
  const [vals, setVals] = useState(defaults);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await fetch(`${BACKEND_URL}/cfa/financial-ratios`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...vals, shareholders_equity: vals.total_equity}) });
      if (!r.ok) throw new Error(`${r.status}`);
      setResult(await r.json());
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  const ratioLabels: Record<string, string> = {
    current_ratio: "Current Ratio", debt_to_equity: "Debt-to-Equity",
    return_on_assets: "Return on Assets", return_on_equity: "Return on Equity",
  };

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Financial Ratios</h1>
      <div className="mb-4 grid max-w-xs gap-3">
        {Object.entries(defaults).map(([k]) => (
          <div key={k}><label className="mb-1 block text-xs text-zinc-400">{labels[k]}</label><input className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" value={vals[k as keyof typeof defaults]} onChange={e => setVals({...vals, [k]: Number(e.target.value)||0})} /></div>
        ))}
      </div>
      <button onClick={submit} disabled={loading} className="mb-4 w-fit rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700">{loading ? "Calculating…" : "Calculate ▷"}</button>
      {err && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{err}</div>}
      {result && <div className="max-w-sm space-y-2">{Object.entries(result).map(([k,v]) => (
        <div key={k} className="flex justify-between rounded border border-zinc-800 px-4 py-2 text-sm"><span className="text-zinc-400">{ratioLabels[k] || k}</span><span className="font-mono">{typeof v === "number" ? v.toFixed(4) : String(v)}</span></div>
      ))}</div>}
    </div>
  );
}
