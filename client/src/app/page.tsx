"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Monaco touches `window`, so it must be client-only (no SSR).
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-zinc-500">
      Loading editor…
    </div>
  ),
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

const STARTER_CODE = `# CFA-System — Python accounting IDE
import pandas as pd

df = pd.DataFrame({
    "account": ["Cash", "Receivables", "Payables"],
    "amount":  [12_500, 4_200, -3_100],
})

print(df)
print("Net:", df["amount"].sum())
`;

type RunResult = {
  stdout: string;
  stderr: string;
  returncode: number;
  timed_out: boolean;
  duration_ms: number;
};

export default function Home() {
  const [code, setCode] = useState(STARTER_CODE);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/execute/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data: RunResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <h1 className="text-sm font-semibold tracking-tight">
          CFA-System <span className="text-zinc-500">· Python IDE</span>
        </h1>
        <button
          onClick={run}
          disabled={running}
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-zinc-700"
        >
          {running ? "Running…" : "Run ▷"}
        </button>
      </header>

      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 min-h-0">
        <section className="min-h-0 border-r border-zinc-800">
          <CodeEditor value={code} onChange={setCode} language="python" />
        </section>

        <section className="flex min-h-0 flex-col">
          <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2 text-xs uppercase tracking-wider text-zinc-400">
            Terminal
          </div>
          <pre className="flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed">
            {error && <span className="text-red-400">Error: {error}{"\n"}</span>}
            {result?.stdout && <span>{result.stdout}</span>}
            {result?.stderr && <span className="text-red-400">{result.stderr}</span>}
            {result && (
              <span className="text-zinc-500">
                {"\n"}── exit {result.returncode}
                {result.timed_out ? " (timed out)" : ""}
                {` · ${result.duration_ms} ms`}
              </span>
            )}
            {!result && !error && !running && (
              <span className="text-zinc-600">
                Press “Run ▷” to execute. Backend: {BACKEND_URL}
              </span>
            )}
          </pre>
        </section>
      </div>
    </main>
  );
}
