import pandas as pd
import pytest

from app.cfa_lib.amortization import loan_amortization
from app.cfa_lib.balance_sheet import create_balance_sheet
from app.cfa_lib.cash_flow import create_cash_flow_statement
from app.cfa_lib.depreciation import straight_line_depreciation
from app.cfa_lib.financial_ratios import (
    current_ratio,
    debt_to_equity,
    return_on_assets,
    return_on_equity,
)
from app.cfa_lib.general_ledger import create_general_ledger
from app.cfa_lib.income_statement import create_income_statement
from app.cfa_lib.journal_entry import validate_journal_entry
from app.cfa_lib.tax_calculator import calculate_tax
from app.cfa_lib.trial_balance import create_trial_balance_df
from app.cfa_lib.inventory import inventory_valuation
from app.cfa_lib.budget import create_budget
from app.cfa_lib.payroll import calculate_payroll


# ── trial_balance ──

def test_trial_balance_balanced():
    entries = [
        {"account": "Cash", "debit": 10000, "credit": 0},
        {"account": "Revenue", "debit": 0, "credit": 10000},
    ]
    df = create_trial_balance_df(entries)
    assert len(df) == 2
    assert df.loc[0, "Account"] == "Cash"
    assert df.loc[0, "Debit"] == 10000.0
    assert df.loc[1, "Credit"] == 10000.0
    assert abs(df["Debit"].sum() - df["Credit"].sum()) < 0.001


# ── journal_entry ──

def test_journal_entry_valid():
    entries = [
        {"account": "Cash", "debit": 10000, "credit": 0},
        {"account": "Revenue", "debit": 0, "credit": 10000},
    ]
    result = validate_journal_entry(entries)
    assert result["valid"] is True
    assert len(result["entries"]) == 2


def test_journal_entry_invalid():
    entries = [
        {"account": "Cash", "debit": 10000, "credit": 0},
        {"account": "Revenue", "debit": 0, "credit": 5000},
    ]
    result = validate_journal_entry(entries)
    assert result["valid"] is False
    assert "Debits" in result["error"] and "Credits" in result["error"]


# ── general_ledger ──

def test_general_ledger():
    entries = [
        {"account": "Cash", "debit": 10000, "credit": 0, "date": "2026-01-01", "description": "Deposit"},
        {"account": "Cash", "debit": 0, "credit": 2000, "date": "2026-01-05", "description": "Rent"},
    ]
    df = create_general_ledger(entries)
    assert len(df) == 2
    assert df.loc[1, "balance"] == 8000.0


# ── income_statement ──

def test_income_statement():
    entries = [
        {"account": "Revenue", "debit": 0, "credit": 5000},
        {"account": "Expenses", "debit": 2000, "credit": 0},
    ]
    df = create_income_statement(entries)
    assert df.loc[df["item"] == "Revenue", "amount"].values[0] == 5000
    assert df.loc[df["item"] == "Expenses", "amount"].values[0] == 2000
    assert df.loc[df["item"] == "Net Income", "amount"].values[0] == 3000


# ── balance_sheet ──

def test_balance_sheet():
    entries = [
        {"account": "Asset-Cash", "debit": 10000, "credit": 0},
        {"account": "Liability-Loan", "debit": 0, "credit": 3000},
        {"account": "Equity-Capital", "debit": 0, "credit": 7000},
    ]
    df = create_balance_sheet(entries)
    assets = df.loc[df["item"] == "Assets", "amount"].values[0]
    liabilities = df.loc[df["item"] == "Liabilities", "amount"].values[0]
    equity = df.loc[df["item"] == "Equity", "amount"].values[0]
    assert assets == 10000
    assert liabilities == 3000
    assert equity == 7000
    assert assets == liabilities + equity


# ── tax_calculator ──

def test_calculate_tax():
    result = calculate_tax(100000, 25)
    assert result["income"] == 100000
    assert result["tax_rate"] == 25
    assert result["tax_amount"] == 25000
    assert result["net_income"] == 75000


# ── depreciation ──

def test_straight_line_depreciation():
    result = straight_line_depreciation(50000, 5000, 10)
    assert result["cost"] == 50000
    assert result["annual_depreciation"] == 4500


# ── cash_flow ──

def test_cash_flow_statement():
    operating = [{"account": "Sales", "amount": 50000}, {"account": "Salaries", "amount": -20000}]
    investing = [{"account": "Equipment", "amount": -15000}]
    financing = [{"account": "Loan", "amount": 10000}, {"account": "Dividends", "amount": -5000}]
    df = create_cash_flow_statement(operating, investing, financing)
    last_row = df.iloc[-1]
    assert last_row["account"] == "Net Change in Cash"
    assert last_row["amount"] == 20000.0


# ── financial_ratios ──

def test_current_ratio():
    assert current_ratio(200000, 100000) == 2.0


def test_current_ratio_zero_liabilities():
    assert current_ratio(100, 0) is None


def test_debt_to_equity():
    assert debt_to_equity(300000, 500000) == 0.6


def test_debt_to_equity_zero_equity():
    assert debt_to_equity(50, 0) is None


def test_return_on_assets():
    assert return_on_assets(80000, 1000000) == 0.08


def test_return_on_equity():
    assert return_on_equity(80000, 500000) == 0.16


# ── amortization ──

def test_loan_amortization():
    df = loan_amortization(10000, 5, 3)
    assert len(df) == 3
    assert df.iloc[0]["month"] == 1
    assert df.iloc[-1]["balance"] == 0.0
    assert df["payment"].nunique() == 1  # same payment every month


def test_loan_amortization_zero_rate():
    df = loan_amortization(10000, 0, 3)
    assert len(df) == 3
    assert df.iloc[0]["interest"] == 0.0
    assert df.iloc[-1]["balance"] == 0.0


def test_loan_amortization_zero_months():
    df = loan_amortization(10000, 5, 0)
    assert len(df) == 0


# ── inventory ──

def test_inventory_fifo():
    items = [
        {"name": "Widget", "quantity": 100, "unit_cost": 10},
        {"name": "Widget", "quantity": 50, "unit_cost": 15},
    ]
    df = inventory_valuation(items, "fifo")
    assert df.loc[0, "name"] == "Widget"
    assert df.loc[0, "unit_cost"] == 10.0


def test_inventory_wac():
    items = [
        {"name": "Item", "quantity": 200, "unit_cost": 5},
        {"name": "Item", "quantity": 100, "unit_cost": 8},
    ]
    df = inventory_valuation(items, "wac")
    total = 200 * 5 + 100 * 8
    avg = total / 300
    assert df.loc[0, "unit_cost"] == round(avg, 2)


# ── classification_map ──

def test_balance_sheet_with_map():
    entries = [{"account": "Cash", "debit": 10000, "credit": 0}]
    df = create_balance_sheet(entries, {"Cash": "Asset"})
    assert df.loc[df["item"] == "Assets", "amount"].values[0] == 10000


def test_income_statement_with_map():
    entries = [{"account": "Sales", "debit": 0, "credit": 5000}]
    df = create_income_statement(entries, {"Sales": "Revenue"})
    assert df.loc[df["item"] == "Revenue", "amount"].values[0] == 5000


# ── payroll ──

def test_calculate_payroll():
    result = calculate_payroll(160, 50, 20, 500)
    assert result["gross_pay"] == 8000
    assert result["net_pay"] == 5900


# ── budget ──

def test_create_budget():
    items = [{"category": "Rent", "budgeted": 2000, "actual": 2000}]
    df = create_budget(items)
    assert df.loc[0, "variance"] == 0.0
