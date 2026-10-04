# ocr-service/main.py
import io
import os
import time
import numpy as np
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from paddleocr import PaddleOCR

from preprocessing import preprocess_image
from field_extraction import extract_fields, FIELD_DEFS

app = FastAPI(title="PackCheck OCR Service")

MAX_FILE_SIZE = 8 * 1024 * 1024  # match frontend's 8MB limit
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

OCR_SHARED_SECRET = os.environ.get("OCR_SHARED_SECRET")

# PaddleOCR loads its detection + recognition model weights from disk (or
# downloads them, on a fresh container) at construction time, which takes
# several seconds to a couple of minutes — this must happen exactly once,
# at process startup, not per request. _ocr_engine starts as None so
# /health can report "still loading" rather than silently 500ing on the
# first request that races the model load.
_ocr_engine: PaddleOCR | None = None


@app.on_event("startup")
def load_ocr_engine():
    global _ocr_engine
    t0 = time.perf_counter()
    # NOTE: verify these constructor kwargs against your installed
    # paddleocr version's `PaddleOCR.__init__` signature — kwarg names
    # for enabling the angle/orientation classifier have shifted across
    # major releases (use_angle_cls in 2.x; some 3.x builds expose it as
    # use_textline_orientation instead). If use_angle_cls raises a
    # TypeError on your installed version, swap it for whichever the
    # installed release documents.
    _ocr_engine = PaddleOCR(
        use_textline_orientation=True,  # replaces the deprecated use_angle_cls
        lang="en",
        use_doc_orientation_classify=False,  # skip — irrelevant for package photos
        use_doc_unwarping=False,  # skip — meant for scanned pages, not packages
        enable_mkldnn=False,
    )
    print(f"[STARTUP] PaddleOCR models loaded in {time.perf_counter() - t0:.1f}s")


def verify_secret(x_internal_secret: str = Header(default=None)):
    if OCR_SHARED_SECRET and x_internal_secret != OCR_SHARED_SECRET:
        raise HTTPException(403, "Forbidden")


@app.get("/health")
@app.head("/health")
def health():
    return {"status": "ok" if _ocr_engine is not None else "loading"}


def _reading_order_lines(paddle_result) -> list[dict]:
    """
    Converts one PaddleOCR result into a list of lines carrying both text
    and position: [{"text", "conf", "min_x", "max_x", "min_y", "max_y", "cy"}, ...]

    Position is kept (not discarded) so field_extraction.py can pair a
    label with its value by actual row/column geometry — a flat
    top-to-bottom, left-to-right ordering scrambles two-column layouts
    (label column | value column), where a value box can land before or
    several lines away from its own label purely because of small
    baseline differences between columns.
    """
    if paddle_result is None:
        return []

    texts = paddle_result.get("rec_texts") or []
    scores = paddle_result.get("rec_scores") or []
    polys = paddle_result.get("rec_polys")
    if polys is None:
        polys = paddle_result.get("dt_polys")

    if not texts:
        return []

    ROW_BUCKET_PX = 15

    entries = []
    for i, text in enumerate(texts):
        stripped = str(text).strip()
        if not stripped:
            continue
        conf = float(scores[i]) * 100 if i < len(scores) else 0.0

        if polys is not None and i < len(polys):
            poly = np.asarray(polys[i])
            min_x, min_y = float(poly[:, 0].min()), float(poly[:, 1].min())
            max_x, max_y = float(poly[:, 0].max()), float(poly[:, 1].max())
        else:
            # No geometry returned — every line collapses to the same
            # position, which field_extraction.py detects and falls back
            # to same-line-only matching for (no crash, just reduced
            # accuracy on multi-column labels).
            min_x = min_y = max_x = max_y = 0.0

        entries.append({
            "text": stripped,
            "conf": conf,
            "min_x": min_x, "max_x": max_x,
            "min_y": min_y, "max_y": max_y,
            "cy": (min_y + max_y) / 2,
        })

    # Kept as a readable top-to-bottom ordering for debugging and as a
    # last-resort fallback — actual label/value pairing in
    # field_extraction.py uses the x/y fields directly, not this order.
    entries.sort(key=lambda e: (round(e["cy"] / ROW_BUCKET_PX), e["min_x"]))
    return entries


@app.post("/extract", dependencies=[Depends(verify_secret)])
async def extract(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, f"Unsupported file type: {image.content_type}")

    raw = await image.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(400, "File exceeds 8MB limit")

    if _ocr_engine is None:
        raise HTTPException(503, "OCR engine still loading — retry shortly")

    print(f"[TIMING] Received image: {len(raw) / 1024:.1f} KB")

    try:
        pil_image = Image.open(io.BytesIO(raw))
    except Exception:
        raise HTTPException(400, "Could not decode image file")

    print(f"[TIMING] Original dimensions: {pil_image.size}")

    t0 = time.perf_counter()
    processed = preprocess_image(pil_image)
    t1 = time.perf_counter()
    print(f"[TIMING] preprocess_image: {t1 - t0:.2f}s")

    result = _ocr_engine.predict(processed)
    t2 = time.perf_counter()
    print(f"[TIMING] PaddleOCR predict: {t2 - t1:.2f}s")

    paddle_result = result[0] if result else None
    lines = _reading_order_lines(paddle_result)
    print(f"[TIMING] Line count: {len(lines)}")
    print("[DEBUG] Lines with geometry:")
    for l in lines:
        print(f"  y={l['min_y']:.0f}-{l['max_y']:.0f} (cy={l['cy']:.0f})  x={l['min_x']:.0f}-{l['max_x']:.0f}  conf={l['conf']:.1f}  text={l['text']!r}")

    t3 = time.perf_counter()
    if not lines:
        # PaddleOCR found no text at all — genuinely nothing to extract.
        extracted_fields = [
            {"field": f["field"], "value": "—", "confidence": 0, "status": "missing"}
            for f in FIELD_DEFS
        ]
    else:
        extracted_fields = extract_fields(lines)
    t4 = time.perf_counter()
    print(f"[TIMING] extract_fields (fuzzy regex): {t4 - t3:.2f}s")

    print(f"[TIMING] TOTAL: {t4 - t0:.2f}s")

    return {"extractedFields": extracted_fields}
