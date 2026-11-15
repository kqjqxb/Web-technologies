"""Тести API на окремій тимчасовій базі: pytest -v"""
import os
import sys
import tempfile
from pathlib import Path

os.environ["TECH_CARDS_DB"] = str(Path(tempfile.mkdtemp()) / "test.db")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_list_seeded(client):
    r = client.get("/cards/")
    assert r.status_code == 200
    assert [c["detail"] for c in r.json()][:2] == ["Вал приводний", "Корпус редуктора"]


def test_crud_cycle(client):
    r = client.post("/cards/", json={"detail": "Кронштейн", "processing_type": "Зварювальна", "duration": 35})
    assert r.status_code == 201
    card_id = r.json()["id"]
    assert client.get("/card/", params={"id": card_id}).json()["detail"] == "Кронштейн"

    r = client.patch(f"/card/{card_id}", json={"duration": 50})
    assert r.status_code == 200 and r.json()["duration"] == 50 and r.json()["detail"] == "Кронштейн"

    new = {"detail": "Кронштейн посилений", "processing_type": "Зварювальна", "duration": 55}
    r = client.put(f"/card/{card_id}", json=new)
    assert r.json()["detail"] == "Кронштейн посилений"

    assert client.delete(f"/card/{card_id}").status_code == 200
    assert client.get("/card/", params={"id": card_id}).status_code == 404
    assert client.delete(f"/card/{card_id}").status_code == 404


def test_sort_and_search(client):
    cards = client.get("/cards/", params={"sort": "duration", "order": "desc"}).json()
    durations = [c["duration"] for c in cards]
    assert durations == sorted(durations, reverse=True)
    found = client.get("/cards/", params={"search": "вал"}).json()
    assert [c["detail"] for c in found] == ["Вал приводний"]


@pytest.mark.parametrize("body", [
    {"detail": "В", "processing_type": "Токарна", "duration": 10},
    {"detail": "Шайба", "processing_type": "Лазерна", "duration": 10},
    {"detail": "Шайба", "processing_type": "Токарна", "duration": 0},
    {"detail": "Шайба", "processing_type": "Токарна", "duration": 2.5},
    {"detail": "Шайба", "processing_type": "Токарна"},
])
def test_validation(client, body):
    assert client.post("/cards/", json=body).status_code == 422


def test_patch_empty(client):
    assert client.patch("/card/1", json={}).status_code == 400
    assert client.patch("/card/1", json={"detail": None}).status_code == 422
