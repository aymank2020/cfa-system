"use client";

import { useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

interface Row { account: string; debit: number; credit: number; }

export default function JournalEntryPage() {
  const [rows, setRows] = useState<Row[]>([{ account: "", debit: 0, credit: 0 }]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function upd(i: number, f: keyof Row, v: string) {
    const n = [...rows]; n[i] = { ...n[i], [f]: f === "account" ? v : Number(v)||0 }; setRows(n);
  }

  async function submit() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await fetch(`${BACKEND_URL}/cfa/journal-entry`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(rows) });
      if (!r.ok) throw new Error(`${r.status}`);
      setResult(await r.json());
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  const valid = result?.valid === true;
  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Journal Entry Validation</h1>
      <div className="mb-4 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500" placeholder="Account" value={r.account} onChange={e => upd(i,"account",e.target.value)} />
            <input className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" placeholder="Debit" value={r.debit||""} onChange={e => upd(i,"debit",e.target.value)} />
            <input className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" placeholder="Credit" value={r.credit||""} onChange={e => upd(i,"credit",e.target.value)} />
            <button onClick={() => rows.length>1 && setRows(rows.filter((_,j)=>j!==i))} className="rounded p-1 text-zinc-500 hover:text-red-400">✕</button>
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setRows([...rows,{account:"",debit:0,credit:0}])} className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">+ Add Row</button>
        <button onClick={submit} disabled={loading} className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700">{loading ? "Validating…" : "Validate ▷"}</button>
      </div>
      {err && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{err}</div>}
      {result && (
        <div className={`rounded border px-4 py-3 text-sm ${valid ? "border-emerald-800 bg-emerald-950/50 text-emerald-300" : "border-red-800 bg-red-950/50 text-red-400"}`}>
          {valid ? "✅ Journal entry is balanced (debits = credits)" : `❌ ${result.error as string}`}
        </div>
      )}
    </div>
  );
}
