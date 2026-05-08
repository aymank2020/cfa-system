def validate_journal_entry(entries):
    total_debits = sum(e["debit"] for e in entries)
    total_credits = sum(e["credit"] for e in entries)

    if total_debits != total_credits:
        return {
            "valid": False,
            "error": f"Debits ({total_debits}) != Credits ({total_credits})",
        }

    return {"valid": True, "entries": entries}
