from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import execute, files

app = FastAPI(title="CFA System", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(files.router)
app.include_router(execute.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ok"}
