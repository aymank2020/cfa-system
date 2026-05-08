"use client";

import EntryForm from "@/components/EntryForm";

export default function TrialBalancePage() {
  return (
    <EntryForm
      title="Trial Balance"
      endpoint="/cfa/trial-balance"
      columns={["ACCOUNT", "DEBIT", "CREDIT", "BALANCE"]}
      renderRow={(row) => (
        <>
          <td className="px-3 py-2">{row.Account as string}</td>
          <td className="px-3 py-2">{(row.Debit as number).toFixed(2)}</td>
          <td className="px-3 py-2">{(row.Credit as number).toFixed(2)}</td>
          <td className="px-3 py-2">{(row.Balance as number).toFixed(2)}</td>
        </>
      )}
    />
  );
}
