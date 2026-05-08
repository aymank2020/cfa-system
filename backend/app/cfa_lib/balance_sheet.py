import pandas as pd


def _classify(account):
    name = account.lower()
    if "asset" in name:
        return "Asset"
    if "liability" in name:
        return "Liability"
    return "Equity"


def create_balance_sheet(entries):
    df = pd.DataFrame(entries)
    df["type"] = df["account"].apply(_classify)

    assets = df[df["type"] == "Asset"]["debit"].sum() - df[df["type"] == "Asset"]["credit"].sum()
    liabilities = df[df["type"] == "Liability"]["credit"].sum() - df[df["type"] == "Liability"]["debit"].sum()
    equity = df[df["type"] == "Equity"]["credit"].sum() - df[df["type"] == "Equity"]["debit"].sum()

    return pd.DataFrame({
        "item": ["Assets", "Liabilities", "Equity", "Liabilities + Equity"],
        "amount": [assets, liabilities, equity, liabilities + equity],
    })
