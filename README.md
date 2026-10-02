# CFA-System

A web-based IDE for **accounting and financial analysis in Python** — think Replit, but purpose-built for parsing ledgers, computing taxes, generating balance sheets, and visualising financial data.

> **Status:** local MVP with a Next.js financial-tool frontend, file APIs, Python execution, and accounting helpers. Execution sandboxing and authentication remain open deployment requirements.

## Features

**Working today**
- FastAPI backend with CORS for `localhost:3000`
- Per-user `workspace/` directory for user files
- `GET /files/list` — flat listing of the workspace
- `POST /files/read` — read a workspace file (UTF-8, 2 MiB cap)
- `POST /files/write` — create/overwrite a file, atomic rename
- `POST /execute/run` — run a Python snippet via the backend venv, with timeout + output caps

**Planned**
- Execution sandbox and authenticated per-user workspaces
- WebSocket streaming for long-running executions
- CSV / XLSX upload endpoint
- Deeper validation of accounting inputs and error behavior
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
│   │   └── cfa_lib/             (accounting helpers)
│   ├── requirements.txt
│   └── .venv/                   gitignored
├── client/                      Next.js financial tools and editor interface
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

The frontend is implemented with Next.js, TypeScript, Tailwind CSS, and Monaco:

```bash
cd client
npm ci
npm run dev
```

Run `python -m pytest tests/ -q` from `backend` and `npm run build` from `client`.
Workspace API regressions cover user-owned sibling files, simultaneous saves,
and save -> Python execute -> read through the registered HTTP endpoints.

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
