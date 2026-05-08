import pandas as pd


def create_income_statement(entries):
    df = pd.DataFrame(entries)
    df["type"] = df["account"].apply(
        lambda a: "Revenue" if "revenue" in a.lower() else "Expense"
    )

    revenues = (
        df[df["type"] == "Revenue"]["credit"].sum()
        - df[df["type"] == "Revenue"]["debit"].sum()
    )
    expenses = (
        df[df["type"] == "Expense"]["debit"].sum()
        - df[df["type"] == "Expense"]["credit"].sum()
    )

    return pd.DataFrame({
        "item": ["Revenue", "Expenses", "Net Income"],
        "amount": [revenues, expenses, revenues - expenses],
    })
