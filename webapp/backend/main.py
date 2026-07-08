
from __future__ import annotations

import hashlib
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


ROOT = Path(__file__).resolve().parents[2]
RAW_DATA = ROOT / "raw_data"
DATA_DIR = ROOT / "data"

CATEGORIES = ["drawings", "hentai", "neutral", "porn", "sexy"]


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
    counts: Dict[str, int] = {}
    for cat in CATEGORIES:
        folder = base / cat
        counts[cat] = count_files(folder)
    return counts


def dataset_split_counts() -> Dict[str, Dict[str, int]]:
    result: Dict[str, Dict[str, int]] = {"train": {}, "test": {}}
    for split in ("train", "test"):
        split_dir = DATA_DIR / split
        if split_dir.exists():
            for cat in CATEGORIES:
                result[split][cat] = count_files(split_dir / cat)
        else:
            for cat in CATEGORIES:
                result[split][cat] = 0
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
            events.append({
                "title": f"{cat}",
                "detail": "لا توجد ملفات حديثة",
                "time": "—",
            })
        else:
            dt = datetime.fromtimestamp(latest[0]).strftime("%Y-%m-%d %H:%M")
            events.append({
                "title": f"{cat}",
                "detail": latest[1].name,
                "time": dt,
            })
    return events


def demo_label(data: bytes) -> Tuple[str, float]:
    digest = hashlib.sha256(data).digest()
    value = digest[0] % len(CATEGORIES)
    confidence = 0.74 + (digest[1] / 255) * 0.23
    return CATEGORIES[value], round(min(confidence, 0.99), 3)


app = FastAPI(title="Quina Review Center", version="1.0.0")

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
        "note": "إذا كانت الملفات غير مكتملة، ستظهر رسالة تعطل مؤقت داخل الواجهة.",
    }


@app.get("/api/summary")
def summary():
    raw_counts = category_counts(RAW_DATA)
    splits = dataset_split_counts()
    total_raw = sum(raw_counts.values())
    total_train = sum(splits["train"].values())
    total_test = sum(splits["test"].values())
    last_build = datetime.utcnow().strftime("%Y-%m-%d %H:%M")

    return {
        "title": "Quina",
        "subtitle": "لوحة منظمة لعرض حالة البيانات والنماذج",
        "raw_counts": raw_counts,
        "splits": splits,
        "totals": {
            "raw": total_raw,
            "train": total_train,
            "test": total_test,
        },
        "recent_events": recent_events(),
        "last_build": last_build,
        "service_state": "ready" if RAW_DATA.exists() else "temporary_issue",
    }


@app.post("/api/analyze", response_model=UploadResponse)
async def analyze(
    file: UploadFile = File(...),
    display_name: str = Form(""),
):
    content = await file.read()
    size_kb = round(len(content) / 1024, 2)
    label, confidence = demo_label(content)
    safe_name = display_name.strip() or file.filename or "file"

    if not content:
        return UploadResponse(
            ok=False,
            mode="demo",
            title="تعذر إكمال الطلب الآن",
            label="temporary_issue",
            confidence=0.0,
            message="الملف فارغ أو لم يكتمل رفعه. جرّب مرة أخرى بعد قليل.",
            file_name=safe_name,
            size_kb=size_kb,
            created_at=datetime.utcnow().isoformat() + "Z",
        )

    return UploadResponse(
        ok=True,
        mode="demo",
        title="تمت المعالجة",
        label=label,
        confidence=confidence,
        message="تم استلام الملف بنجاح. هذه واجهة عرض جاهزة ويمكن ربطها بالموديل لاحقًا.",
        file_name=safe_name,
        size_kb=size_kb,
        created_at=datetime.utcnow().isoformat() + "Z",
    )


@app.get("/api/activity")
def activity():
    items = []
    for event in recent_events():
        items.append({
            "name": event["title"],
            "value": event["detail"],
            "time": event["time"],
        })
    return {"items": items}
