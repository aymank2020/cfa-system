"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

const tools: { name: string; href: string; icon: string }[] = [
  { name: "Trial Balance", href: "/trial-balance", icon: "⚖️" },
  { name: "Journal Entry", href: "#", icon: "📝" },
  { name: "General Ledger", href: "#", icon: "📓" },
  { name: "Income Statement", href: "/income-statement", icon: "📊" },
  { name: "Balance Sheet", href: "/balance-sheet", icon: "📋" },
  { name: "Tax Calculator", href: "#", icon: "💰" },
  { name: "Depreciation", href: "#", icon: "📉" },
  { name: "Cash Flow", href: "#", icon: "💵" },
  { name: "Financial Ratios", href: "#", icon: "📐" },
  { name: "Amortization", href: "#", icon: "🏦" },
];

export default function Sidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      <aside className="flex w-56 flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-4 py-3">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            CFA-System
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {tools.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.name}
                href={t.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-emerald-700/30 text-emerald-300"
                    : t.href === "#"
                      ? "text-zinc-500 cursor-not-allowed"
                      : "text-zinc-300 hover:bg-zinc-800"
                }`}
                onClick={(e) => t.href === "#" && e.preventDefault()}
              >
                <span>{t.icon}</span>
                <span>{t.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex flex-1 flex-col min-w-0">{children}</main>
    </div>
  );
}
