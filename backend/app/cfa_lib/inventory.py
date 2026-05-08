import pandas as pd


def inventory_valuation(items, method="fifo"):
    df = pd.DataFrame(items)
    if method == "fifo":
        df["total_cost"] = df["quantity"] * df["unit_cost"]
        return df
    elif method == "wac":
        avg_cost = (df["quantity"] * df["unit_cost"]).sum() / df["quantity"].sum()
        df["weighted_avg_cost"] = round(avg_cost, 2)
        df["total_cost"] = df["quantity"] * avg_cost
        df["total_cost"] = df["total_cost"].round(2)
        return df
    else:
        raise ValueError(f"Unknown method: {method}")
