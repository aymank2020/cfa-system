"use client";

import { useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export default function DepreciationPage() {
  const [cost, setCost] = useState(50000);
  const [salvage, setSalvage] = useState(5000);
  const [life, setLife] = useState(10);
  const [result, setResult] = useState<Record<string, number> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await fetch(`${BACKEND_URL}/cfa/depreciation`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({cost, salvage_value: salvage, useful_life: life}) });
      if (!r.ok) throw new Error(`${r.status}`);
      setResult(await r.json());
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Straight-Line Depreciation</h1>
      <div className="mb-4 grid max-w-sm gap-3">
        <div><label className="mb-1 block text-xs text-zinc-400">Asset Cost ($)</label><input className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" value={cost} onChange={e => setCost(Number(e.target.value)||0)} /></div>
        <div><label className="mb-1 block text-xs text-zinc-400">Salvage Value ($)</label><input className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" value={salvage} onChange={e => setSalvage(Number(e.target.value)||0)} /></div>
        <div><label className="mb-1 block text-xs text-zinc-400">Useful Life (years)</label><input className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" value={life} onChange={e => setLife(Number(e.target.value)||0)} /></div>
      </div>
      <button onClick={submit} disabled={loading} className="mb-4 w-fit rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700">{loading ? "Calculating…" : "Calculate ▷"}</button>
      {err && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{err}</div>}
      {result && <div className="max-w-sm space-y-2">{Object.entries(result).map(([k,v]) => (
        <div key={k} className="flex justify-between rounded border border-zinc-800 px-4 py-2 text-sm"><span className="text-zinc-400">{k.replace(/_/g," ")}</span><span className="font-mono">${Number(v).toFixed(2)}</span></div>
      ))}</div>}
    </div>
  );
}
