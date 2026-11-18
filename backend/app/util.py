from .models import RequirementIn

# Same wording pattern as the demo data ("Needs kiln repair" etc.), in both languages.
NEED_TITLES = {
    "funding": ("Needs working capital", "कार्यशील पूँजी चाहिए"),
    "materials": ("Needs raw materials", "कच्चा माल चाहिए"),
    "tools": ("Needs tools", "औज़ार चाहिए"),
    "market": ("Needs a market channel", "बाज़ार चाहिए"),
}


def indian_rupees(raw: str | None) -> str | None:
    """'1850000' -> '₹18,50,000'. Non-numeric text is kept as typed."""
    if not raw or not raw.strip():
        return None
    digits = raw.replace(",", "").replace("₹", "").strip()
    if not digits.isdigit():
        return raw.strip()
    s = str(int(digits))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts + [tail])
    return f"₹{s}"


def requirement_from_input(req: RequirementIn) -> dict:
    title, title_hi = NEED_TITLES[req.category]
    return {
        "category": req.category,
        "title": title, "titleHi": title_hi,
        "detail": req.detail.strip(), "detailHi": req.detail.strip(),
        "amount": indian_rupees(req.amount),
    }
