from __future__ import annotations

import pandas as pd

def create_trial_balance_df(
    entries: list[dict[str, str | float]]
) -> pd.DataFrame:
    """Creates a formatted Trial Balance DataFrame from a list of account entries.

    Each entry dict should have 'account' (str), 'debit' (float), and 'credit' (float).
    The function calculates the balance for each account.
    """
    if not entries:
        return pd.DataFrame(columns=["Account", "Debit", "Credit", "Balance"])

    df = pd.DataFrame(entries)

    # Ensure debit and credit are numeric, fill NaN with 0
    df["debit"] = pd.to_numeric(df["debit"], errors="coerce").fillna(0)
    df["credit"] = pd.to_numeric(df["credit"], errors="coerce").fillna(0)

    # Calculate Balance: Debit - Credit
    df["balance"] = df["debit"] - df["credit"]

    # Rename columns for presentation
    df = df.rename(columns={
        "account": "Account",
        "debit": "Debit",
        "credit": "Credit",
        "balance": "Balance",
    })

    # Reorder columns for traditional trial balance format
    return df[["Account", "Debit", "Credit", "Balance"]]
