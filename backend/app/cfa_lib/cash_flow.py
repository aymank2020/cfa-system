import pandas as pd


def create_cash_flow_statement(operating, investing, financing):
    sections = {
        "Operating Activities": operating,
        "Investing Activities": investing,
        "Financing Activities": financing,
    }

    rows = []
    net_change = 0
    for category, items in sections.items():
        rows.append({"category": category, "account": "", "amount": 0})
        for item in items:
            rows.append({"category": "", "account": item["account"], "amount": item["amount"]})
        total = sum(item["amount"] for item in items)
        rows.append({"category": "", "account": "Net Cash", "amount": total})
        net_change += total

    rows.append({"category": "", "account": "Net Change in Cash", "amount": net_change})

    return pd.DataFrame(rows)
