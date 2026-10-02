from concurrent.futures import ThreadPoolExecutor

import pytest
from fastapi.testclient import TestClient

from app.api import execute, files
from app.main import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(files, "WORKSPACE_DIR", tmp_path)
    monkeypatch.setattr(execute, "WORKSPACE_DIR", tmp_path)
    with TestClient(app) as client:
        yield client


def test_save_preserves_user_owned_tmp_sibling(client, tmp_path):
    sibling = tmp_path / "report.py.tmp"
    sibling.write_text("user-owned data", encoding="utf-8")
    response = client.post("/files/write", json={"path": "report.py", "content": "print('saved')"})
    assert response.status_code == 200
    assert sibling.read_text(encoding="utf-8") == "user-owned data"
    assert client.post("/files/read", json={"path": "report.py"}).json()["content"] == "print('saved')"
    assert not list(tmp_path.glob(".cfa-write-*"))


def test_concurrent_saves_each_succeed_without_partial_content(client):
    contents = [str(index) * 20000 for index in range(12)]
    with ThreadPoolExecutor(max_workers=6) as pool:
        responses = list(pool.map(lambda content: client.post("/files/write", json={"path": "shared.py", "content": content}), contents))
    assert all(response.status_code == 200 for response in responses)
    assert client.post("/files/read", json={"path": "shared.py"}).json()["content"] in contents


def test_save_execute_read_roundtrip(client):
    assert client.post("/files/write", json={"path": "input.txt", "content": "42"}).status_code == 200
    result = client.post("/execute/run", json={"code": "from pathlib import Path\nPath('output.txt').write_text(str(int(Path('input.txt').read_text()) * 2))\nprint('done')", "timeout": 5})
    assert result.status_code == 200
    assert result.json()["returncode"] == 0
    assert result.json()["stdout"].strip() == "done"
    assert client.post("/files/read", json={"path": "output.txt"}).json()["content"] == "84"
