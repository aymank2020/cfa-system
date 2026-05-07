"""Code execution API.

POST /run accepts a Python snippet, writes it to a temp file, runs it with
the workspace venv's Python, and returns stdout/stderr/returncode.

SECURITY NOTE (read before shipping):
    This endpoint runs arbitrary code on the server with the uvicorn process's
    full privileges. It is fine for local single-user dev. It is NOT safe to
    expose to the internet or to untrusted users. Hardening plan (not yet
    implemented):

      - Run inside a Docker container or firejail/nsjail per request.
      - Drop network access (``--network=none`` or equivalent).
      - CPU + memory + file-size rlimits.
      - Per-user workspace mount; no host FS access outside it.
      - A dedicated low-privilege UID, not the uvicorn user.

    Until that's in place, treat this as "Replit, but the sandbox is a sticky
    note that says 'please don't'." It's marked TODO(sandbox) inline.
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/execute", tags=["execute"])

# Limits
MAX_CODE_BYTES = 256 * 1024  # 256 KiB of source code is plenty for one snippet
MAX_OUTPUT_BYTES = 1 * 1024 * 1024  # 1 MiB cap on stdout/stderr each
DEFAULT_TIMEOUT_SECONDS = 30
MAX_TIMEOUT_SECONDS = 120

# Workspace = cwd for the child process, so `open("data/x.csv")` etc. work.
WORKSPACE_DIR = Path.home() / "CFA-System" / "workspace"

# Prefer the backend venv's python so pandas/openpyxl are available to the
# snippet. Falls back to the interpreter running uvicorn.
_VENV_PY = Path.home() / "CFA-System" / "backend" / ".venv" / "bin" / "python"
PYTHON_EXECUTABLE = str(_VENV_PY) if _VENV_PY.exists() else sys.executable


class RunRequest(BaseModel):
    code: str = Field(..., description="Python source to execute.")
    timeout: int | None = Field(
        default=None,
        ge=1,
        le=MAX_TIMEOUT_SECONDS,
        description=f"Seconds before the subprocess is killed. Default {DEFAULT_TIMEOUT_SECONDS}.",
    )


def _truncate(data: bytes, cap: int) -> tuple[str, bool]:
    """Decode bytes to UTF-8 (replacing errors) and flag if we truncated."""
    truncated = len(data) > cap
    if truncated:
        data = data[:cap]
    return data.decode("utf-8", errors="replace"), truncated


@router.post("/run")
async def run_code(body: RunRequest) -> dict:
    """Execute a Python snippet and return its output.

    Request JSON:
        {"code": "print('hi')", "timeout": 10}

    Response:
        {
          "stdout": "...",
          "stderr": "...",
          "returncode": 0,
          "timed_out": false,
          "duration_ms": 123,
          "stdout_truncated": false,
          "stderr_truncated": false
        }
    """
    if len(body.code.encode("utf-8")) > MAX_CODE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"code too large (max {MAX_CODE_BYTES} bytes)",
        )

    timeout = body.timeout or DEFAULT_TIMEOUT_SECONDS
    WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)

    # Write to a temp file OUTSIDE the workspace so listings stay clean and
    # a concurrent run can't collide with a user file named the same thing.
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".py",
        prefix="cfa_run_",
        delete=False,
        encoding="utf-8",
    ) as tmp:
        tmp.write(body.code)
        tmp_path = Path(tmp.name)

    # TODO(sandbox): wrap this in docker/nsjail, drop network, apply rlimits.
    import time

    start = time.monotonic()
    timed_out = False
    try:
        try:
            proc = subprocess.run(
                [PYTHON_EXECUTABLE, str(tmp_path)],
                cwd=str(WORKSPACE_DIR),
                capture_output=True,
                timeout=timeout,
                # Unbuffered so users see prints immediately in future streaming mode.
                env={"PYTHONUNBUFFERED": "1", "PATH": "/usr/bin:/bin"},
                check=False,
            )
            stdout_raw, stderr_raw, returncode = proc.stdout, proc.stderr, proc.returncode
        except subprocess.TimeoutExpired as exc:
            timed_out = True
            stdout_raw = exc.stdout or b""
            stderr_raw = (exc.stderr or b"") + f"\n[killed: timed out after {timeout}s]\n".encode()
            returncode = -1
    finally:
        try:
            tmp_path.unlink(missing_ok=True)
        except OSError:
            pass

    duration_ms = int((time.monotonic() - start) * 1000)
    stdout, stdout_truncated = _truncate(stdout_raw, MAX_OUTPUT_BYTES)
    stderr, stderr_truncated = _truncate(stderr_raw, MAX_OUTPUT_BYTES)

    return {
        "stdout": stdout,
        "stderr": stderr,
        "returncode": returncode,
        "timed_out": timed_out,
        "duration_ms": duration_ms,
        "stdout_truncated": stdout_truncated,
        "stderr_truncated": stderr_truncated,
    }
