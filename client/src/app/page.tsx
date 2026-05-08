"use client";

import Link from "next/link";

const cards = [
  { name: "Trial Balance", href: "/trial-balance", icon: "⚖️", desc: "List all accounts with debit/credit balances" },
  { name: "Journal Entry", href: "/journal-entry", icon: "📝", desc: "Validate that debits equal credits" },
  { name: "General Ledger", href: "/general-ledger", icon: "📓", desc: "View accounts with running balances" },
  { name: "Income Statement", href: "/income-statement", icon: "📊", desc: "Calculate revenue, expenses, and net income" },
  { name: "Balance Sheet", href: "/balance-sheet", icon: "📋", desc: "Assets = Liabilities + Equity check" },
  { name: "Cash Flow", href: "/cash-flow", icon: "💵", desc: "Operating, investing, and financing activities" },
  { name: "Tax Calculator", href: "/tax-calculator", icon: "💰", desc: "Compute tax amount and after-tax income" },
  { name: "Depreciation", href: "/depreciation", icon: "📉", desc: "Straight-line depreciation calculation" },
  { name: "Financial Ratios", href: "/financial-ratios", icon: "📐", desc: "Current ratio, D/E, ROA, ROE" },
  { name: "Amortization", href: "/amortization", icon: "🏦", desc: "Full loan amortization schedule" },
  { name: "Payroll", href: "/payroll", icon: "👔", desc: "Calculate gross pay, taxes, and net pay" },
  { name: "Budget", href: "/budget", icon: "📊", desc: "Budget vs actual with variance analysis" },
  { name: "Inventory", href: "/inventory", icon: "📦", desc: "FIFO and weighted average cost valuation" },
];

export default function Home() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <h1 className="mb-2 text-2xl font-bold">CFA-System</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Select a financial analysis tool to get started.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            className="group rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-emerald-700 hover:bg-zinc-800/50"
          >
            <div className="mb-2 text-2xl">{c.icon}</div>
            <h3 className="text-sm font-medium text-zinc-200 group-hover:text-emerald-300">
              {c.name}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
