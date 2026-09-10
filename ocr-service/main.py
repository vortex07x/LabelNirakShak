# ocr-service/main.py
import io
import os
import pytesseract
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from pytesseract import Output

from preprocessing import preprocess_image
from field_extraction import extract_fields, FIELD_DEFS

pytesseract.pytesseract.tesseract_cmd = r'D:\tessaract\tesseract.exe'

app = FastAPI(title="PackCheck OCR Service")

MAX_FILE_SIZE = 8 * 1024 * 1024  # match frontend's 8MB limit
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}

OCR_SHARED_SECRET = os.environ.get("OCR_SHARED_SECRET")


def verify_secret(x_internal_secret: str = Header(default=None)):
    if OCR_SHARED_SECRET and x_internal_secret != OCR_SHARED_SECRET:
        raise HTTPException(403, "Forbidden")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/extract", dependencies=[Depends(verify_secret)])
async def extract(image: UploadFile = File(...)):
    if image.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(400, f"Unsupported file type: {image.content_type}")

    raw = await image.read()
    if len(raw) > MAX_FILE_SIZE:
        raise HTTPException(400, "File exceeds 8MB limit")

    try:
        pil_image = Image.open(io.BytesIO(raw))
    except Exception:
        raise HTTPException(400, "Could not decode image file")

    processed = preprocess_image(pil_image)

    data = pytesseract.image_to_data(processed, output_type=Output.DICT)

    lines_map = {}
    for i in range(len(data["text"])):
        word = data["text"][i].strip()
        conf = float(data["conf"][i])
        if not word or conf < 0:  # tesseract uses -1 conf for non-text regions
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        if key not in lines_map:
            lines_map[key] = {"words": [], "confs": []}
        lines_map[key]["words"].append(word)
        lines_map[key]["confs"].append(conf)

    lines = [
        {
            "text": " ".join(v["words"]),
            "conf": sum(v["confs"]) / len(v["confs"]),
        }
        for v in lines_map.values()
    ]

    if not lines:
        # Tesseract found no text at all — genuinely nothing to extract.
        extracted_fields = [
            {"field": f["field"], "value": "—", "confidence": 0, "status": "missing"}
            for f in FIELD_DEFS
        ]
    else:
        extracted_fields = extract_fields(lines)

    return {"extractedFields": extracted_fields}