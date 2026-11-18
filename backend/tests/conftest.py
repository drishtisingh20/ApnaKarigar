"""Runs the API against mongomock (no MongoDB needed) via a tiny async adapter."""
import os
import sys
import tempfile
from pathlib import Path

import mongomock
import pytest

os.environ["UPLOAD_DIR"] = tempfile.mkdtemp()
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


class AsyncCursor:
    def __init__(self, cur): self.cur = cur
    def sort(self, *a): self.cur = self.cur.sort(*a); return self
    def skip(self, n): self.cur = self.cur.skip(n); return self
    def limit(self, n): self.cur = self.cur.limit(n); return self
    async def to_list(self, length=None): return list(self.cur)


class AsyncCollection:
    def __init__(self, col): self._col = col
    def find(self, *a, **k): return AsyncCursor(self._col.find(*a, **k))

    def __getattr__(self, name):
        fn = getattr(self._col, name)
        async def call(*a, **k): return fn(*a, **k)
        return call


class FakeDB:
    def __init__(self): self._db = mongomock.MongoClient().db
    def __getattr__(self, name): return AsyncCollection(self._db[name])


@pytest.fixture(scope="session")
def client():
    import app.db as database
    database.db = FakeDB()  # must happen before the routers import `db`
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app) as c:
        yield c
