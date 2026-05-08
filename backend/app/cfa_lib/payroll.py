def calculate_payroll(hours_worked, hourly_rate, tax_rate, deductions):
    gross_pay = hours_worked * hourly_rate
    tax_amount = gross_pay * (tax_rate / 100)
    net_pay = gross_pay - tax_amount - deductions
    return {
        "gross_pay": gross_pay,
        "tax_amount": tax_amount,
        "deductions_total": deductions,
        "net_pay": net_pay,
    }
