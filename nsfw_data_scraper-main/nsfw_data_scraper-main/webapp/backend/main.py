
from __future__ import annotations

import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


def locate_root() -> Path:
    current = Path(__file__).resolve().parents[2]
    candidates = [
        current,
        current / "nsfw_data_scraper-main" / "nsfw_data_scraper-main",
        current.parent / "nsfw_data_scraper-main" / "nsfw_data_scraper-main",
    ]
    for candidate in candidates:
        if (candidate / "raw_data").exists() or (candidate / "data").exists():
            return candidate
    return current


ROOT = locate_root()
RAW_DATA = ROOT / "raw_data"
DATA_DIR = ROOT / "data"

CATEGORIES = ["drawings", "hentai", "neutral", "porn", "sexy"]

CATEGORY_LABELS = {
    "drawings": "رسومات",
    "hentai": "هنتاي",
    "neutral": "حيادي",
    "porn": "إباحية",
    "sexy": "مثير",
}

SOURCE_MANIFEST = [
    {
        "id": "drawings",
        "label": CATEGORY_LABELS["drawings"],
        "subtitle": "مصدر بصري",
        "kind": "مجموعة أعمال",
        "state": "نشط",
        "cadence": "تحديث متواصل",
        "accent": "sky",
    },
    {
        "id": "hentai",
        "label": CATEGORY_LABELS["hentai"],
        "subtitle": "صور وفصول",
        "kind": "مجموعة أعمال",
        "state": "نشط",
        "cadence": "تحديث متواصل",
        "accent": "fuchsia",
    },
    {
        "id": "neutral",
        "label": CATEGORY_LABELS["neutral"],
        "subtitle": "مواد عامة",
        "kind": "مجموعة أعمال",
        "state": "نشط",
        "cadence": "تحديث متواصل",
        "accent": "emerald",
    },
    {
        "id": "porn",
        "label": CATEGORY_LABELS["porn"],
        "subtitle": "محتوى مخصص",
        "kind": "مجموعة أعمال",
        "state": "نشط",
        "cadence": "تحديث متواصل",
        "accent": "rose",
    },
    {
        "id": "sexy",
        "label": CATEGORY_LABELS["sexy"],
        "subtitle": "أعمال سريعة",
        "kind": "مجموعة أعمال",
        "state": "نشط",
        "cadence": "تحديث متواصل",
        "accent": "amber",
    },
]

CATALOG = [
    {
        "id": "midnight-bloom",
        "title": "Midnight Bloom",
        "source": "hentai",
        "category": "hentai",
        "chapters": 16,
        "rating": 4.9,
        "updated": "قبل 12 دقيقة",
        "synopsis": "مجموعة أعمال مرتبة بعناية مع متابعة سريعة، وفصول واضحة للفتح والاستكمال.",
        "tags": ["متعدد المصادر", "سريع", "محدّث"],
        "theme": ["#d946ef", "#111827"],
    },
    {
        "id": "velvet-frame",
        "title": "Velvet Frame",
        "source": "sexy",
        "category": "sexy",
        "chapters": 12,
        "rating": 4.7,
        "updated": "قبل 25 دقيقة",
        "synopsis": "بطاقات مشاهدة أنيقة مع مسار واضح للفصول وأدوات سريعة لإدارة المفضلة.",
        "tags": ["واجهة نظيفة", "مفضلة", "سهل التصفح"],
        "theme": ["#f59e0b", "#111827"],
    },
    {
        "id": "plain-signal",
        "title": "Plain Signal",
        "source": "neutral",
        "category": "neutral",
        "chapters": 21,
        "rating": 4.8,
        "updated": "قبل ساعة",
        "synopsis": "مجموعة عامة منظمة للمراجعة والبحث، مناسبة لعرض سريع عبر الهاتف والكمبيوتر.",
        "tags": ["عام", "بحث", "مرن"],
        "theme": ["#10b981", "#0f172a"],
    },
    {
        "id": "rose-static",
        "title": "Rose Static",
        "source": "porn",
        "category": "porn",
        "chapters": 18,
        "rating": 4.6,
        "updated": "أمس",
        "synopsis": "صفحة تفاصيل مرتبة مع فتح مباشر، وسجل نشاط واضح، ومسار مشاهدة متصل.",
        "tags": ["مباشر", "سجل", "تنظيم"],
        "theme": ["#fb7185", "#111827"],
    },
    {
        "id": "paper-neon",
        "title": "Paper Neon",
        "source": "drawings",
        "category": "drawings",
        "chapters": 27,
        "rating": 4.8,
        "updated": "قبل 2 ساعة",
        "synopsis": "لوحات رسومية عالية التنظيم مع عرض صفحات واضح وتحكم سريع في التنقل.",
        "tags": ["رسومات", "عرض صفحات", "تنقل"],
        "theme": ["#38bdf8", "#111827"],
    },
]


class UploadResponse(BaseModel):
    ok: bool
    mode: str
    title: str
    label: str
    confidence: float
    message: str
    file_name: str
    size_kb: float
    created_at: str


def count_files(path: Path) -> int:
    if not path.exists():
        return 0
    return sum(1 for p in path.rglob("*") if p.is_file())


def category_counts(base: Path) -> Dict[str, int]:
    return {cat: count_files(base / cat) for cat in CATEGORIES}


def dataset_split_counts() -> Dict[str, Dict[str, int]]:
    result: Dict[str, Dict[str, int]] = {"train": {}, "test": {}}
    for split in ("train", "test"):
        split_dir = DATA_DIR / split
        for cat in CATEGORIES:
            result[split][cat] = count_files(split_dir / cat) if split_dir.exists() else 0
    return result


def total_size_mb(path: Path) -> float:
    if not path.exists():
        return 0.0
    total = 0
    for p in path.rglob("*"):
        if p.is_file():
            try:
                total += p.stat().st_size
            except OSError:
                pass
    return round(total / (1024 * 1024), 2)


def recent_events() -> List[dict]:
    events: List[dict] = []
    for cat in CATEGORIES:
        folder = RAW_DATA / cat
        latest = None
        if folder.exists():
            for p in folder.rglob("*"):
                if p.is_file():
                    try:
                        m = p.stat().st_mtime
                    except OSError:
                        continue
                    if latest is None or m > latest[0]:
                        latest = (m, p)
        if latest is None:
            events.append({"title": CATEGORY_LABELS[cat], "detail": "لا توجد ملفات حديثة", "time": "—"})
        else:
            dt = datetime.fromtimestamp(latest[0]).strftime("%Y-%m-%d %H:%M")
            events.append({"title": CATEGORY_LABELS[cat], "detail": latest[1].name, "time": dt})
    return events


def build_chapters(item: dict) -> List[dict]:
    total = int(item["chapters"])
    chapters = []
    for idx in range(total):
        n = idx + 1
        pages = 12 + ((n * 3 + len(item["id"])) % 10)
        chapters.append(
            {
                "id": f'{item["id"]}-ch-{n}',
                "title": f"فصل {n}",
                "pages": pages,
                "updated": f"قبل {n * 4} دقيقة",
            }
        )
    return chapters


def demo_label(data: bytes) -> Tuple[str, float]:
    digest = hashlib.sha256(data).digest()
    value = digest[0] % len(CATEGORIES)
    confidence = 0.74 + (digest[1] / 255) * 0.23
    return CATEGORIES[value], round(min(confidence, 0.99), 3)


app = FastAPI(title="Quina Review Center", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status")
def status():
    raw_exists = RAW_DATA.exists()
    data_exists = DATA_DIR.exists()
    return {
        "ok": True,
        "service": "ready" if raw_exists else "missing_data",
        "mode": "demo",
        "repo_root": str(ROOT),
        "raw_data_found": raw_exists,
        "train_data_found": (DATA_DIR / "train").exists(),
        "test_data_found": (DATA_DIR / "test").exists(),
        "raw_size_mb": total_size_mb(RAW_DATA),
        "data_size_mb": total_size_mb(DATA_DIR),
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "message": "جاهز",
    }


@app.get("/api/summary")
def summary():
    raw_counts = category_counts(RAW_DATA)
    splits = dataset_split_counts()
    total_raw = sum(raw_counts.values())
    total_train = sum(splits["train"].values())
    total_test = sum(splits["test"].values())
    return {
        "title": "Quina",
        "subtitle": "",
        "raw_counts": raw_counts,
        "splits": splits,
        "totals": {"raw": total_raw, "train": total_train, "test": total_test},
        "source_catalog": [
            {
                "key": cat,
                "label": CATEGORY_LABELS[cat],
                "file": f"urls_{cat}.txt",
                "url_count": max(1, raw_counts[cat]),
                "raw_count": raw_counts[cat],
                "train_count": splits["train"][cat],
                "test_count": splits["test"][cat],
            }
            for cat in CATEGORIES
        ],
        "recent_events": recent_events(),
        "last_build": datetime.utcnow().isoformat(timespec="minutes"),
        "service_state": "ready" if total_raw > 0 else "temporary_issue",
    }


@app.get("/api/overview")
def overview():
    raw_counts = category_counts(RAW_DATA)
    splits = dataset_split_counts()
    return {
        "ok": True,
        "service": "ready" if RAW_DATA.exists() else "missing_data",
        "stats": {
            "raw": sum(raw_counts.values()),
            "train": sum(splits["train"].values()),
            "test": sum(splits["test"].values()),
            "sources": len(SOURCE_MANIFEST),
            "catalog": len(CATALOG),
        },
        "sources": [
            {
                **source,
                "count": raw_counts.get(source["id"], 0),
                "train": splits["train"].get(source["id"], 0),
                "test": splits["test"].get(source["id"], 0),
            }
            for source in SOURCE_MANIFEST
        ],
        "catalog": CATALOG,
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/api/sources")
def sources():
    raw_counts = category_counts(RAW_DATA)
    splits = dataset_split_counts()
    items = []
    for source in SOURCE_MANIFEST:
        items.append(
            {
                **source,
                "count": raw_counts.get(source["id"], 0),
                "train": splits["train"].get(source["id"], 0),
                "test": splits["test"].get(source["id"], 0),
                "items": [item for item in CATALOG if item["category"] == source["id"]],
            }
        )
    return {"items": items}


@app.get("/api/catalog")
def catalog(
    q: str | None = Query(default=None),
    source: str | None = Query(default=None),
    category: str | None = Query(default=None),
):
    items = list(CATALOG)
    if source:
        items = [item for item in items if item["source"] == source or item["category"] == source]
    if category:
        items = [item for item in items if item["category"] == category]
    if q:
        needle = q.lower().strip()
        items = [
            item
            for item in items
            if needle in item["title"].lower()
            or needle in item["synopsis"].lower()
            or needle in " ".join(item["tags"]).lower()
        ]
    return {"items": items}


@app.get("/api/items/{item_id}")
def item_detail(item_id: str):
    item = next((row for row in CATALOG if row["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    payload = dict(item)
    payload["chapters"] = build_chapters(item)
    return payload


@app.get("/api/search")
def search(q: str = "", source: str = "all", category: str = "all"):
    items = list(CATALOG)
    if source != "all":
        items = [item for item in items if item["source"] == source or item["category"] == source]
    if category != "all":
        items = [item for item in items if item["category"] == category]
    needle = q.lower().strip()
    if needle:
        items = [
            item
            for item in items
            if needle in item["title"].lower()
            or needle in item["synopsis"].lower()
            or needle in " ".join(item["tags"]).lower()
        ]
    return {"items": items}


@app.get("/api/chapters/{item_id}")
def chapters(item_id: str):
    item = next((row for row in CATALOG if row["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"items": build_chapters(item)}


@app.post("/api/analyze", response_model=UploadResponse)
async def analyze(file: UploadFile = File(...), title: str = Form(default="")):
    data = await file.read()
    label, confidence = demo_label(data)
    return UploadResponse(
        ok=True,
        mode="demo",
        title=title or "تم التحليل",
        label=CATEGORY_LABELS[label],
        confidence=confidence,
        message="جاهز",
        file_name=file.filename or "upload",
        size_kb=round(len(data) / 1024, 2),
        created_at=datetime.utcnow().isoformat() + "Z",
    )
