"use client";

import { useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

interface Row { name: string; quantity: number; unit_cost: number; }

export default function InventoryPage() {
  const [rows, setRows] = useState<Row[]>([{ name: "", quantity: 0, unit_cost: 0 }]);
  const [method, setMethod] = useState("fifo");
  const [result, setResult] = useState<Record<string, unknown>[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function upd(i: number, f: keyof Row, v: string) {
    const n = [...rows]; n[i] = { ...n[i], [f]: f === "name" ? v : Number(v)||0 }; setRows(n);
  }

  async function submit() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const r = await fetch(`${BACKEND_URL}/cfa/inventory?method=${method}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(rows) });
      if (!r.ok) throw new Error(`${r.status}`);
      setResult(await r.json());
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Inventory Valuation</h1>
      <div className="mb-4 flex items-center gap-3">
        <label className="text-xs text-zinc-400">Method:</label>
        <select value={method} onChange={e => setMethod(e.target.value)} className="rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100">
          <option value="fifo">FIFO</option>
          <option value="wac">Weighted Average Cost</option>
        </select>
      </div>
      <div className="mb-4 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <input className="w-32 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500" placeholder="Item name" value={r.name} onChange={e => upd(i,"name",e.target.value)} />
            <input className="w-24 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" placeholder="Qty" value={r.quantity||""} onChange={e => upd(i,"quantity",e.target.value)} />
            <input className="w-24 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" placeholder="Unit cost" value={r.unit_cost||""} onChange={e => upd(i,"unit_cost",e.target.value)} />
            <button onClick={() => rows.length>1 && setRows(rows.filter((_,j)=>j!==i))} className="rounded p-1 text-zinc-500 hover:text-red-400">✕</button>
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setRows([...rows,{name:"",quantity:0,unit_cost:0}])} className="rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">+ Add Item</button>
        <button onClick={submit} disabled={loading} className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700">{loading ? "Running…" : "Valuate ▷"}</button>
      </div>
      {err && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{err}</div>}
      {result && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-zinc-800 text-zinc-400"><th className="px-3 py-2 uppercase">Name</th><th className="px-3 py-2 uppercase">Quantity</th><th className="px-3 py-2 uppercase">Unit Cost</th><th className="px-3 py-2 uppercase">Total Value</th></tr></thead>
            <tbody>{result.map((row, i) => (
              <tr key={i} className="border-b border-zinc-800/50">
                <td className="px-3 py-2">{row.name as string}</td>
                <td className="px-3 py-2">{(row.quantity as number).toFixed(0)}</td>
                <td className="px-3 py-2 font-mono">${(row.unit_cost as number).toFixed(2)}</td>
                <td className="px-3 py-2 font-mono">${(row.total_value as number).toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
