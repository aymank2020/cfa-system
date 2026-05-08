def calculate_tax(income, tax_rate):
    tax_amount = income * (tax_rate / 100)
    net_income = income - tax_amount
    return {
        "income": income,
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "net_income": net_income,
    }
