import io

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 64


def auth(token): return {"Authorization": f"Bearer {token}"}


def register(client, **kw):
    body = {"name": "Test User", "phone": "9876500001", "password": "secret1", "role": "buyer", **kw}
    return client.post("/auth/register", json=body)


def test_seed_matches_frontend_shape(client):
    arts = client.get("/artisans").json()
    assert [a["id"] for a in arts][:5] == ["meena", "raju", "lakshmi", "tsering", "fatima"]
    meena = arts[0]
    assert meena["craftHi"] and meena["requirement"]["titleHi"]
    assert meena["requirement"]["amount"] == "₹18,000"
    assert meena["workIds"] == ["w1", "w2"]
    works = client.get("/works").json()
    assert [w["id"] for w in works][:3] == ["w1", "w2", "w3"]
    assert works[0]["artisanName"] == "Meena Devi"
    assert [w["id"] for w in client.get("/works", params={"artisanId": "raju"}).json()] == ["w3", "w4"]


def test_filter_and_search(client):
    assert [a["id"] for a in client.get("/artisans", params={"category": "tools"}).json()] == ["raju", "tsering"]
    assert [a["id"] for a in client.get("/artisans", params={"q": "khurja"}).json()] == ["raju"]
    assert client.get("/artisans/nobody").status_code == 404


def test_auth_flow_and_duplicates(client):
    r = register(client)
    assert r.status_code == 201 and r.json()["user"]["role"] == "buyer"
    assert "passwordHash" not in r.text
    assert register(client).status_code == 409
    assert client.post("/auth/login", json={"phone": "9876500001", "password": "bad"}).status_code == 401
    ok = client.post("/auth/login", json={"phone": "9876500001", "password": "secret1"}).json()
    assert client.get("/auth/me", headers=auth(ok["token"])).json()["name"] == "Test User"
    assert client.get("/auth/me").status_code == 401
    assert register(client, phone="12").status_code == 422


def test_artisan_publish_flow(client):
    reg = register(client, name="Sita Devi", phone="9876500002", role="artisan",
                   craft="Madhubani painting", village="Madhubani, Bihar").json()
    tok, uid = reg["token"], reg["user"]["id"]
    # new artisan is discoverable, listed first, with a default requirement
    first = client.get("/artisans").json()[0]
    assert first["id"] == uid and first["requirement"]["title"] and first["workIds"] == []

    # photo upload: bytes are sniffed, not trusted
    bad = client.post("/upload", headers=auth(tok), files={"file": ("x.png", io.BytesIO(b"not an image"), "image/png")})
    assert bad.status_code == 415
    up = client.post("/upload", headers=auth(tok), files={"file": ("a.png", io.BytesIO(PNG), "image/png")})
    assert up.status_code == 201
    url = up.json()["url"]
    assert url.startswith("/uploads/") and client.get(url).status_code == 200

    # publish a work + current need in one call
    w = client.post("/works", headers=auth(tok), json={
        "title": "Fish painting", "description": "Natural pigments", "image": url,
        "requirement": {"category": "funding", "detail": "Need cloth and pigment", "amount": "1850000"},
    })
    assert w.status_code == 201
    work = w.json()
    assert work["artisanName"] == "Sita Devi" and work["titleHi"] == "Fish painting"
    art = client.get(f"/artisans/{uid}").json()
    assert art["workIds"] == [work["id"]]
    assert art["requirement"]["amount"] == "₹18,50,000" and art["requirement"]["title"] == "Needs working capital"
    assert client.get("/works").json()[0]["id"] == work["id"]  # newest first in community feed

    # permissions
    buyer = register(client, phone="9876500003").json()
    assert client.post("/works", headers=auth(buyer["token"]), json={"title": "x", "image": "y"}).status_code == 403
    assert client.post("/works", json={"title": "x", "image": "y"}).status_code == 401
    assert client.delete(f"/works/{work['id']}", headers=auth(buyer["token"])).status_code == 403
    assert client.delete(f"/works/{work['id']}", headers=auth(tok)).status_code == 204
    assert client.get(f"/artisans/{uid}").json()["workIds"] == []


def test_support_offers(client):
    buyer = client.post("/auth/login", json={"phone": "9876500001", "password": "secret1"}).json()
    artisan = client.post("/auth/login", json={"phone": "9876500002", "password": "secret1"}).json()
    aid = artisan["user"]["id"]
    assert client.post(f"/artisans/{aid}/support", json={}).status_code == 401
    assert client.post(f"/artisans/{aid}/support", headers=auth(buyer["token"]), json={"message": "Can fund cloth"}).status_code == 201
    assert client.post(f"/artisans/{aid}/support", headers=auth(buyer["token"]), json={}).status_code == 201  # idempotent
    assert client.post("/artisans/ghost/support", headers=auth(buyer["token"]), json={}).status_code == 404
    assert client.post(f"/artisans/{aid}/support", headers=auth(artisan["token"]), json={}).status_code == 400
    assert client.get("/supports/mine", headers=auth(buyer["token"])).json() == [aid]
    offers = client.get("/supports/received", headers=auth(artisan["token"])).json()
    assert len(offers) == 1 and offers[0]["supporterPhone"] == "9876500001"
    assert client.get("/supports/received", headers=auth(buyer["token"])).status_code == 403
