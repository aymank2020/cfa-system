import pandas as pd


def _legacy_classify(account):
    return "Revenue" if "revenue" in account.lower() else "Expense"


def create_income_statement(entries, classification_map=None):
    if classification_map is None:
        classification_map = {}
    df = pd.DataFrame(entries)
    df["type"] = df["account"].apply(lambda a: classification_map.get(a) or _legacy_classify(a))

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
