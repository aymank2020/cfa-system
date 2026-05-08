import pandas as pd


def inventory_valuation(items, method="fifo"):
    if method == "fifo":
        layers = {}
        for item in items:
            name = item["name"]
            if name not in layers:
                layers[name] = []
            layers[name].append({"qty": item["quantity"], "cost": item["unit_cost"]})

        rows = []
        for name, lots in layers.items():
            remaining = sum(lot["qty"] for lot in lots)
            # sell the earliest (first-in) lots first — report earliest layer cost
            cost = lots[0]["cost"]
            rows.append({"name": name, "quantity": remaining, "unit_cost": cost, "total_value": round(remaining * cost, 2)})
        return pd.DataFrame(rows)

    elif method == "wac":
        total_qty = sum(item["quantity"] for item in items)
        total_cost = sum(item["quantity"] * item["unit_cost"] for item in items)
        avg = total_cost / total_qty if total_qty > 0 else 0
        rows = []
        for item in items:
            rows.append({"name": item["name"], "quantity": item["quantity"], "unit_cost": round(avg, 2), "total_value": round(item["quantity"] * avg, 2)})
        return pd.DataFrame(rows)

    raise ValueError(f"Unknown method: {method}")
