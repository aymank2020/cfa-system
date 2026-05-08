"use client";

import { useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

interface Item { account: string; amount: number; }
type Section = { label: string; key: string; items: Item[]; };

export default function CashFlowPage() {
  const [sections, setSections] = useState<Section[]>([
    { label: "Operating Activities", key: "operating", items: [{ account: "", amount: 0 }] },
    { label: "Investing Activities", key: "investing", items: [{ account: "", amount: 0 }] },
    { label: "Financing Activities", key: "financing", items: [{ account: "", amount: 0 }] },
  ]);
  const [result, setResult] = useState<Record<string, unknown>[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function upd(si: number, ii: number, f: keyof Item, v: string) {
    const n = [...sections];
    n[si] = { ...n[si], items: [...n[si].items] };
    n[si].items[ii] = { ...n[si].items[ii], [f]: f === "account" ? v : Number(v)||0 };
    setSections(n);
  }

  async function submit() {
    setLoading(true); setErr(null); setResult(null);
    try {
      const body = { operating: sections[0].items, investing: sections[1].items, financing: sections[2].items };
      const r = await fetch(`${BACKEND_URL}/cfa/cash-flow-statement`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
      if (!r.ok) throw new Error(`${r.status}`);
      setResult(await r.json());
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="mb-4 text-lg font-semibold">Cash Flow Statement</h1>
      {sections.map((sec, si) => (
        <div key={sec.key} className="mb-4">
          <h2 className="mb-2 text-sm font-medium text-zinc-300">{sec.label}</h2>
          {sec.items.map((item, ii) => (
            <div key={ii} className="mb-1 flex items-center gap-2">
              <input className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500" placeholder="Item name" value={item.account} onChange={e => upd(si, ii, "account", e.target.value)} />
              <input className="w-28 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100" type="number" placeholder="Amount" value={item.amount||""} onChange={e => upd(si, ii, "amount", e.target.value)} />
              <button onClick={() => { const n=[...sections]; n[si]={...n[si], items:n[si].items.filter((_,j)=>j!==ii)}; setSections(n); }} className="rounded p-1 text-zinc-500 hover:text-red-400">✕</button>
            </div>
          ))}
          <button onClick={() => { const n=[...sections]; n[si]={...n[si], items:[...n[si].items,{account:"",amount:0}]}; setSections(n); }} className="mt-1 rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800">+ Add</button>
        </div>
      ))}
      <button onClick={submit} disabled={loading} className="mb-4 w-fit rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:bg-zinc-700">{loading ? "Running…" : "Generate ▷"}</button>
      {err && <div className="mb-4 rounded border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-400">{err}</div>}
      {result && (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b border-zinc-800 text-zinc-400"><th className="px-3 py-2 uppercase">Category</th><th className="px-3 py-2 uppercase">Account</th><th className="px-3 py-2 uppercase">Amount</th></tr></thead>
            <tbody>{result.map((row, i) => (
              <tr key={i} className={`border-b border-zinc-800/50 ${row.account === "Net Change in Cash" ? "font-bold text-emerald-300" : ""} ${row.account === "Net Cash" ? "text-zinc-300 font-medium" : ""}`}>
                <td className="px-3 py-2 text-zinc-500">{row.category as string}</td>
                <td className="px-3 py-2">{row.account as string}</td>
                <td className="px-3 py-2 font-mono">${(row.amount as number).toFixed(2)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
