import pandas as pd


def create_general_ledger(entries):
    df = pd.DataFrame(entries)
    df = df.sort_values("date").reset_index(drop=True)
    df["balance"] = df.groupby("account")["debit"].cumsum() - df.groupby("account")["credit"].cumsum()
    return df
