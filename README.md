# CFA-System

A web-based IDE for **accounting and financial analysis in Python** — think Replit, but purpose-built for parsing ledgers, computing taxes, generating balance sheets, and visualising financial data.

> **Status:** early development. Backend MVP (files + execute) is working. Frontend and sandboxing are next.

## Features

**Working today**
- FastAPI backend with CORS for `localhost:3000`
- Per-user `workspace/` directory for user files
- `GET /files/list` — flat listing of the workspace
- `POST /files/read` — read a workspace file (UTF-8, 2 MiB cap)
- `POST /files/write` — create/overwrite a file, atomic rename
- `POST /execute/run` — run a Python snippet via the backend venv, with timeout + output caps

**Planned**
- Next.js frontend with Monaco editor, file tree, terminal panel
- WebSocket streaming for long-running executions
- CSV / XLSX upload endpoint
- `cfa_lib/` — reusable tax / P&L / balance-sheet helpers
- Real execution sandbox (Docker or nsjail) — currently **not sandboxed**
- Auth + per-user workspaces
- Chart rendering (matplotlib/plotly)

## Architecture

```
┌──────────────────────── BROWSER (Next.js) ───────────────────────┐
│  Monaco editor  │  File tree  │  Terminal  │  Chart viewer       │
└───────┬────────────────────────────────────────────────┬─────────┘
        │ HTTP (REST)                                    │ WS (streamed stdout — planned)
┌───────▼────────────────────────────────────────────────▼─────────┐
│                     FastAPI backend (Uvicorn)                    │
│  /files/list  /files/read  /files/write  /execute/run            │
│                         │                                        │
│                         ▼                                        │
│                  subprocess → workspace/                         │
│                    (pandas · openpyxl · cfa_lib/)                │
└──────────────────────────────────────────────────────────────────┘
```

## Repository layout

```
CFA-System/
├── backend/
│   ├── app/
│   │   ├── main.py              FastAPI app + router wiring
│   │   ├── api/
│   │   │   ├── files.py         /files/list, /files/read, /files/write
│   │   │   └── execute.py       /execute/run
│   │   ├── services/            (reserved for execution/sandbox services)
│   │   └── cfa_lib/             (reserved for accounting helpers)
│   ├── requirements.txt
│   └── .venv/                   gitignored
├── client/                      Next.js frontend (not yet scaffolded)
├── workspace/                   user project files (gitignored)
├── .gitignore
└── README.md
```

## Setup

### Backend

Requires Python 3.12+.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Visit `http://127.0.0.1:8000/docs` for the auto-generated Swagger UI.

### Frontend

Not yet scaffolded. Target stack:
- Next.js (TypeScript)
- Tailwind CSS
- `@monaco-editor/react`

## API quick reference

| Method | Path | Body | Purpose |
|---|---|---|---|
| `GET`  | `/` | — | Health check (`{"status":"ok"}`) |
| `GET`  | `/files/list` | — | List workspace entries |
| `POST` | `/files/read` | `{"path":"..."}` | Read a UTF-8 text file |
| `POST` | `/files/write` | `{"path":"...","content":"..."}` | Create / overwrite a file |
| `POST` | `/execute/run` | `{"code":"...","timeout":30}` | Run a Python snippet, return stdout/stderr/returncode |

All file paths are workspace-relative. Traversal (`..`, absolute paths, symlinks pointing outside the workspace) is rejected.

## Security

**Do not expose this to the public internet yet.** The `/execute/run` endpoint runs arbitrary Python with the uvicorn process's privileges. Hardening plan:
- Per-request container or `nsjail` sandbox
- Dropped network inside sandbox
- CPU / memory / file-size rlimits
- Dedicated low-privilege UID
- Auth (JWT / OAuth) in front of everything

Until that's in place, treat this as a single-user, localhost-only tool.

## License

TBD.
