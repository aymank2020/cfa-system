from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.cfa_lib.balance_sheet import create_balance_sheet
from app.cfa_lib.general_ledger import create_general_ledger
from app.cfa_lib.income_statement import create_income_statement
from app.cfa_lib.journal_entry import validate_journal_entry
from app.cfa_lib.trial_balance import create_trial_balance_df

router = APIRouter(prefix="/cfa", tags=["cfa"])


class Entry(BaseModel):
    account: str
    debit: float = 0.0
    credit: float = 0.0


class LedgerEntry(Entry):
    date: str
    description: str


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
