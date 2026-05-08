"use client";

import EntryForm from "@/components/EntryForm";

export default function BalanceSheetPage() {
  return (
    <EntryForm
      title="Balance Sheet"
      endpoint="/cfa/balance-sheet"
      columns={["ITEM", "AMOUNT"]}
      renderRow={(row) => (
        <>
          <td className="px-3 py-2">{row.item as string}</td>
          <td className="px-3 py-2">{(row.amount as number).toFixed(2)}</td>
        </>
      )}
    />
  );
}
