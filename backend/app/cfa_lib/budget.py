import pandas as pd


def create_budget(items):
    df = pd.DataFrame(items)
    df["variance"] = df["budgeted"] - df["actual"]
    return df
