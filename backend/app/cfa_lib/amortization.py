import pandas as pd


def loan_amortization(principal, annual_rate, months):
    if months == 0:
        return pd.DataFrame(columns=["month", "payment", "principal", "interest", "balance"])

    monthly_rate = annual_rate / 12 / 100 if annual_rate != 0 else 0
    payment = (principal * (monthly_rate * (1 + monthly_rate) ** months) / ((1 + monthly_rate) ** months - 1)) if monthly_rate > 0 else principal / months

    rows = []
    balance = principal
    for month in range(1, months + 1):
        interest = balance * monthly_rate
        principal_paid = payment - interest
        balance -= principal_paid
        rows.append({
            "month": month,
            "payment": round(payment, 2),
            "principal": round(principal_paid, 2),
            "interest": round(interest, 2),
            "balance": round(max(balance, 0), 2),
        })

    return pd.DataFrame(rows)
