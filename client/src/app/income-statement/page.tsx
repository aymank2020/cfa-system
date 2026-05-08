"use client";

import EntryForm from "@/components/EntryForm";

export default function IncomeStatementPage() {
  return (
    <EntryForm
      title="Income Statement"
      endpoint="/cfa/income-statement"
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
