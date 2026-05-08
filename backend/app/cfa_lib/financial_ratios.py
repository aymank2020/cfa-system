def current_ratio(current_assets, current_liabilities):
    if current_liabilities == 0:
        return None
    return current_assets / current_liabilities


def debt_to_equity(total_debt, total_equity):
    if total_equity == 0:
        return None
    return total_debt / total_equity


def return_on_assets(net_income, total_assets):
    if total_assets == 0:
        return None
    return net_income / total_assets


def return_on_equity(net_income, shareholders_equity):
    if shareholders_equity == 0:
        return None
    return net_income / shareholders_equity
