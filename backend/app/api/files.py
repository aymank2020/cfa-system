"""File system API endpoints for the user workspace.

The workspace lives at ~/CFA-System/workspace and holds all user-owned
project files (scripts, data, outputs). This router currently exposes a
flat listing; recursive traversal and file contents come later.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/files", tags=["files"])

# Workspace root. Expanded lazily so tests can monkeypatch HOME if needed.
WORKSPACE_DIR = Path.home() / "CFA-System" / "workspace"

# Maximum file size we'll read in one shot. Larger files should stream later.
MAX_READ_BYTES = 2 * 1024 * 1024  # 2 MiB


class ReadFileRequest(BaseModel):
    path: str = Field(..., description="Workspace-relative path to the file to read.")


class WriteFileRequest(BaseModel):
    path: str = Field(..., description="Workspace-relative path to the file to write.")
    content: str = Field(..., description="UTF-8 text content to write. Overwrites existing file.")


def _resolve_within_workspace(rel_path: str) -> Path:
    """Resolve a user-supplied path against the workspace, rejecting escapes.

    Rejects absolute paths and any result that resolves outside WORKSPACE_DIR
    (covers ``..`` traversal and symlinks pointing elsewhere).
    """
    if not rel_path or rel_path.strip() == "":
        raise HTTPException(status_code=400, detail="path must not be empty")

    candidate = Path(rel_path)
    if candidate.is_absolute():
        raise HTTPException(status_code=400, detail="path must be workspace-relative")

    workspace_root = WORKSPACE_DIR.resolve()
    resolved = (workspace_root / candidate).resolve()

    try:
        resolved.relative_to(workspace_root)
    except ValueError:
        raise HTTPException(status_code=400, detail="path escapes the workspace")

    return resolved


@router.get("/list")
async def list_files() -> dict:
    """List files and directories directly under the workspace root.

    Returns:
        dict with:
          - path: absolute workspace path
          - entries: list of {name, type, size} where type is "file" | "dir"
    """
    # Ensure the workspace exists so a fresh clone doesn't 500.
    WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)

    if not WORKSPACE_DIR.is_dir():
        raise HTTPException(
            status_code=500,
            detail=f"Workspace path is not a directory: {WORKSPACE_DIR}",
        )

    entries = []
    for entry in sorted(WORKSPACE_DIR.iterdir(), key=lambda p: (p.is_file(), p.name.lower())):
        try:
            stat = entry.stat()
        except OSError:
            # Broken symlink or permission issue — skip rather than fail the whole listing.
            continue

        entries.append(
            {
                "name": entry.name,
                "type": "dir" if entry.is_dir() else "file",
                "size": stat.st_size if entry.is_file() else None,
            }
        )

    return {"path": str(WORKSPACE_DIR), "entries": entries}


@router.post("/read")
async def read_file(body: ReadFileRequest) -> dict:
    """Read a text file from the workspace and return its contents.

    Request JSON:
        {"path": "relative/path/to/file.py"}

    Response:
        {
            "path": "<workspace-relative path>",
            "size": <int bytes>,
            "content": "<utf-8 text>",
            "encoding": "utf-8"
        }
    """
    WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
    abs_path = _resolve_within_workspace(body.path)

    if not abs_path.exists():
        raise HTTPException(status_code=404, detail="file not found")
    if not abs_path.is_file():
        raise HTTPException(status_code=400, detail="path is not a regular file")

    size = abs_path.stat().st_size
    if size > MAX_READ_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"file too large ({size} bytes; max {MAX_READ_BYTES})",
        )

    try:
        content = abs_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=415,
            detail="file is not valid UTF-8 text",
        )

    rel = abs_path.relative_to(WORKSPACE_DIR.resolve())
    return {
        "path": str(rel),
        "size": size,
        "content": content,
        "encoding": "utf-8",
    }


@router.post("/write")
async def write_file(body: WriteFileRequest) -> dict:
    """Create or overwrite a text file in the workspace.

    Request JSON:
        {"path": "relative/path/to/file.py", "content": "..."}

    Response:
        {
            "path": "<workspace-relative path>",
            "size": <bytes written>,
            "created": <bool>,
            "encoding": "utf-8"
        }
    """
    WORKSPACE_DIR.mkdir(parents=True, exist_ok=True)
    abs_path = _resolve_within_workspace(body.path)

    # Reject writing on top of a directory.
    if abs_path.exists() and not abs_path.is_file():
        raise HTTPException(status_code=400, detail="path exists and is not a regular file")

    # Refuse writes that would exceed the single-shot read limit — keeps read/write
    # symmetric and stops a client from stuffing the workspace with huge payloads.
    encoded = body.content.encode("utf-8")
    if len(encoded) > MAX_READ_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"content too large ({len(encoded)} bytes; max {MAX_READ_BYTES})",
        )

    created = not abs_path.exists()

    # Ensure parent directories exist (e.g. writing "reports/jan/summary.py").
    abs_path.parent.mkdir(parents=True, exist_ok=True)

    # Atomic-ish write: stage to a sibling temp file, then rename. Prevents a
    # truncated file on the disk if the process dies mid-write.
    tmp_path = abs_path.with_name(abs_path.name + ".tmp")
    try:
        tmp_path.write_bytes(encoded)
        tmp_path.replace(abs_path)
    except OSError as exc:
        # Clean up the temp file if rename failed.
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except OSError:
                pass
        raise HTTPException(status_code=500, detail=f"write failed: {exc}")

    rel = abs_path.relative_to(WORKSPACE_DIR.resolve())
    return {
        "path": str(rel),
        "size": len(encoded),
        "created": created,
        "encoding": "utf-8",
    }
