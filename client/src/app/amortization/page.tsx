"use client";

import { useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export default function AmortizationPage() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5);
  const [months, setMonths] = useState(12);
  const [result, setResult] = useState<Record<string, unknown>[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await fetch(`${BACKEND_URL}/cfa/amortization`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({principal, annual_rate: rate, months}) });
      if (!r.ok) throw new Error(`${r.status}`);
      setResult(await r.json());
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Loan Amortization Schedule</h1>
      <div className="mb-4 grid max-w-sm gap-3">
        <div><label className="mb-1 block text-xs text-zinc-400">Principal ($)</label><input className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value)||0)} /></div>
        <div><label className="mb-1 block text-xs text-zinc-400">Annual Rate (%)</label><input className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" value={rate} onChange={e => setRate(Number(e.target.value)||0)} /></div>
        <div><label className="mb-1 block text-xs text-zinc-400">Months</label><input className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" value={months} onChange={e => setMonths(Number(e.target.value)||0)} /></div>
      </div>
      <button onClick={submit} disabled={loading} className="mb-4 w-fit rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700">{loading ? "Calculating…" : "Generate ▷"}</button>
      {err && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{err}</div>}
      {result && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-zinc-800 text-zinc-400"><th className="px-3 py-2 uppercase">Month</th><th className="px-3 py-2 uppercase">Payment</th><th className="px-3 py-2 uppercase">Principal</th><th className="px-3 py-2 uppercase">Interest</th><th className="px-3 py-2 uppercase">Balance</th></tr></thead>
            <tbody>{result.map((row, i) => (
              <tr key={i} className="border-b border-zinc-800/50">
                <td className="px-3 py-2">{row.month as number}</td>
                <td className="px-3 py-2 font-mono">${(row.payment as number).toFixed(2)}</td>
                <td className="px-3 py-2 font-mono">${(row.principal as number).toFixed(2)}</td>
                <td className="px-3 py-2 font-mono">${(row.interest as number).toFixed(2)}</td>
                <td className="px-3 py-2 font-mono">${(row.balance as number).toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
