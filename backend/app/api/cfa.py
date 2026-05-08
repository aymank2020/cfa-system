from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.cfa_lib.trial_balance import create_trial_balance_df

router = APIRouter(prefix="/cfa", tags=["cfa"])


class TrialBalanceEntry(BaseModel):
    account: str = Field(..., description="Name of the account.")
    debit: float = Field(0.0, description="Debit amount for the account.")
    credit: float = Field(0.0, description="Credit amount for the account.")


@router.post("/trial-balance")
async def get_trial_balance(
    entries: list[TrialBalanceEntry],
) -> list[dict[str, str | float]]:
    """Accepts a list of account entries and returns a formatted Trial Balance.

    Args:
        entries: A list of dicts, each with 'account', 'debit', and 'credit'.

    Returns:
        A list of dicts representing the trial balance, including calculated balances.
    """
    # Convert Pydantic models to dicts for the pandas function
    entries_dicts = [entry.model_dump() for entry in entries]
    
    tb_df = create_trial_balance_df(entries_dicts)
    
    # Convert DataFrame back to a list of dicts for JSON response
    return tb_df.to_dict(orient="records")
