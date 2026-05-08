from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.cfa_lib.balance_sheet import create_balance_sheet
from app.cfa_lib.cash_flow import create_cash_flow_statement
from app.cfa_lib.depreciation import straight_line_depreciation
from app.cfa_lib.general_ledger import create_general_ledger
from app.cfa_lib.income_statement import create_income_statement
from app.cfa_lib.journal_entry import validate_journal_entry
from app.cfa_lib.tax_calculator import calculate_tax
from app.cfa_lib.trial_balance import create_trial_balance_df

router = APIRouter(prefix="/cfa", tags=["cfa"])


class Entry(BaseModel):
    account: str
    debit: float = 0.0
    credit: float = 0.0


class LedgerEntry(Entry):
    date: str
    description: str


class TaxInput(BaseModel):
    income: float
    tax_rate: float


class DepreciationInput(BaseModel):
    cost: float
    salvage_value: float
    useful_life: float


class CashFlowItem(BaseModel):
    account: str
    amount: float


@router.post("/trial-balance")
async def get_trial_balance(entries: list[Entry]) -> list[dict[str, str | float]]:
    entries_dicts = [e.model_dump() for e in entries]
    return create_trial_balance_df(entries_dicts).to_dict(orient="records")


@router.post("/journal-entry")
async def post_journal_entry(entries: list[Entry]):
    return validate_journal_entry([e.model_dump() for e in entries])


@router.post("/general-ledger")
async def post_general_ledger(entries: list[LedgerEntry]):
    df = create_general_ledger([e.model_dump() for e in entries])
    return df.to_dict(orient="records")


@router.post("/income-statement")
async def post_income_statement(entries: list[Entry]):
    df = create_income_statement([e.model_dump() for e in entries])
    return df.to_dict(orient="records")


@router.post("/balance-sheet")
async def post_balance_sheet(entries: list[Entry]):
    df = create_balance_sheet([e.model_dump() for e in entries])
    return df.to_dict(orient="records")


@router.post("/tax-calculator")
async def post_tax_calculator(data: TaxInput):
    return calculate_tax(data.income, data.tax_rate)


@router.post("/depreciation")
async def post_depreciation(data: DepreciationInput):
    return straight_line_depreciation(data.cost, data.salvage_value, data.useful_life)


@router.post("/cash-flow-statement")
async def post_cash_flow_statement(
    operating: list[CashFlowItem],
    investing: list[CashFlowItem],
    financing: list[CashFlowItem],
):
    op = [e.model_dump() for e in operating]
    inv = [e.model_dump() for e in investing]
    fin = [e.model_dump() for e in financing]
    df = create_cash_flow_statement(op, inv, fin)
    return df.to_dict(orient="records")
