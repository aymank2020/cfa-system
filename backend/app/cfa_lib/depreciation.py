def straight_line_depreciation(cost, salvage_value, useful_life):
    annual_depreciation = (cost - salvage_value) / useful_life
    return {
        "cost": cost,
        "salvage_value": salvage_value,
        "useful_life": useful_life,
        "annual_depreciation": annual_depreciation,
    }
