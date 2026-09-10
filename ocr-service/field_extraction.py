"""
Extracts Legal Metrology fields from OCR'd text lines using fuzzy
label-proximity matching with candidate scoring and cross-field sanity
checks. Every returned field is either a real match with the confidence
Tesseract reported for that text, or explicitly "missing" — nothing here
fabricates a value or a confidence score.
"""
import re
import regex  # supports fuzzy/approximate matching — pip install regex

LOW_CONFIDENCE_THRESHOLD = 30
MIN_PLAUSIBLE_MRP = 5  # real MRPs are essentially never below this; guards
                        # against a stray digit token being mistaken for one


def _fuzzy_label(labels: list[str], max_errors: int) -> "regex.Pattern":
    """
    Builds a case-insensitive alternation of fuzzy patterns, one per label
    variant.

    IMPORTANT: for short labels (<=5 chars), deletions are disallowed
    (only substitutions/insertions permitted). Without this, a label like
    "B No" (4 chars) can fuzzy-match bare "No." anywhere on the page by
    just deleting the "B" — one edit is enough to erase a quarter of a
    short label's identity, which defeats the point of anchoring on it.
    Longer labels keep full e<=N tolerance since one deletion is a much
    smaller fraction of them.
    """
    parts = []
    for lbl in labels:
        escaped = re.escape(lbl)
        if len(lbl) <= 5:
            parts.append(f"(?:{escaped}){{s<={max_errors},i<={max_errors},d<=0}}")
        else:
            parts.append(f"(?:{escaped}){{e<={max_errors}}}")
    return regex.compile("(?:" + "|".join(parts) + ")", regex.IGNORECASE | regex.BESTMATCH)


def _fuzzy_error_count(match) -> int:
    """Total edit distance of a fuzzy match, 0 for an exact match."""
    try:
        return sum(match.fuzzy_counts)  # (substitutions, insertions, deletions)
    except AttributeError:
        return 0


def _extract_fssai_digits(text: str) -> str | None:
    """
    FSSAI numbers are always exactly 14 digits, but OCR frequently inserts
    spurious whitespace/punctuation mid-number (e.g. "100191 100667...").
    This scans for a run of digits tolerating single-character gaps, strips
    the gaps, and returns the digit string if found — validation of the
    14-digit length happens by the caller, not here, so a genuinely
    incomplete/misread number is correctly reported as missing rather than
    padded or guessed.
    """
    match = re.search(r"\d(?:[\d\s.\-]{0,2}\d){5,20}", text)
    if not match:
        return None
    return re.sub(r"\D", "", match.group(0))


FIELD_DEFS = [
    {
        "field": "MRP (incl. of all taxes)",
        "label_re": _fuzzy_label(["MRP", "M.R.P.", "Maximum Retail Price"], max_errors=1),
        "value_re": re.compile(r"(?:Rs\.?|₹|INR)?\s?(\d{1,6}(?:[.,]\d{1,2})?)"),
        "format_value": lambda m: f"₹{m.group(1).replace(',', '')}",
        "validate": lambda v: float(v[1:].replace(",", "")) >= MIN_PLAUSIBLE_MRP,
    },
    {
        "field": "Net Quantity",
        "label_re": _fuzzy_label(["Net Qty", "Net Quantity", "Net Wt", "Net Weight"], max_errors=2),
        "value_re": re.compile(r"(\d+(?:\.\d+)?)\s?(g|gm|gms|kg|ml|mL|l|L)\b"),
        "format_value": lambda m: f"{m.group(1)} {m.group(2)}",
        "validate": None,
    },
    {
        "field": "Batch No.",
        "label_re": _fuzzy_label(["Batch No", "B No", "Lot No"], max_errors=1),
        "value_re": re.compile(r"\b([A-Z0-9][A-Z0-9\-]{2,14})\b"),
        "format_value": lambda m: m.group(1),
        "validate": None,  # cross-checked against FSSAI after all fields extract
    },
    {
        "field": "Packed Date",
        "label_re": _fuzzy_label(["Pkd", "Packed on", "Packed date", "Mfg Date", "Manufacturing Date"], max_errors=2),
        "value_re": re.compile(r"(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})"),
        "format_value": lambda m: m.group(1),
        "validate": None,
    },
    {
        "field": "Expiry Date",
        "label_re": _fuzzy_label(["Expiry", "Exp Date", "Use By", "Best Before"], max_errors=2),
        "value_re": re.compile(r"(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4})"),
        "format_value": lambda m: m.group(1),
        "validate": None,
    },
    {
        "field": "FSSAI License No.",
        "label_re": _fuzzy_label(["FSSAI", "Lic No", "License No"], max_errors=1),
        "value_re": None,  # handled specially — see extract_fields
        "format_value": None,
        "validate": lambda v: v is not None and len(v) == 14,
    },
    {
        "field": "Manufacturer Name",
        "label_re": _fuzzy_label(["Mfd by", "Manufactured by", "Marketed by", "Packed by"], max_errors=1),
        "value_re": None,  # value = remaining text on the line after the label
        "format_value": None,
        "validate": None,
    },
]


def _score(errors: int, conf: float) -> float:
    """
    Lower is better. Label-match errors dominate the ranking (a cleaner
    label match is a stronger signal that this is really the field's
    line), with OCR line confidence as a tiebreaker between equally-clean
    label matches.
    """
    return errors * 100 - conf


def extract_fields(lines: list[dict]) -> list[dict]:
    """
    lines: [{"text": str, "conf": float}, ...]

    Returns: { field, value, confidence, status: 'valid' | 'low_confidence' | 'missing' }
    """
    results = {}
    raw_values = {}  # field -> raw value, for the cross-field collision check

    for fdef in FIELD_DEFS:
        candidates = []

        for i, line in enumerate(lines):
            label_match = fdef["label_re"].search(line["text"])
            if not label_match:
                continue
            errors = _fuzzy_error_count(label_match)

            if fdef["field"] == "FSSAI License No.":
                digits = _extract_fssai_digits(line["text"])
                conf = line["conf"]
                if digits is None and i + 1 < len(lines):
                    digits = _extract_fssai_digits(lines[i + 1]["text"])
                    conf = (line["conf"] + lines[i + 1]["conf"]) / 2
                if digits is not None:
                    candidates.append({"value": digits, "conf": conf, "errors": errors})
                continue

            if fdef["value_re"] is None:  # manufacturer-style: text after label
                remainder = line["text"][label_match.end():].strip(" :.-")
                if remainder:
                    candidates.append({"value": remainder, "conf": line["conf"], "errors": errors})
                    continue
                if i + 1 < len(lines) and lines[i + 1]["text"].strip():
                    candidates.append({
                        "value": lines[i + 1]["text"].strip(),
                        "conf": (line["conf"] + lines[i + 1]["conf"]) / 2,
                        "errors": errors,
                    })
                continue

            value_match = fdef["value_re"].search(line["text"])
            search_conf = line["conf"]
            if not value_match and i + 1 < len(lines):
                value_match = fdef["value_re"].search(lines[i + 1]["text"])
                search_conf = (line["conf"] + lines[i + 1]["conf"]) / 2
            if value_match:
                candidates.append({
                    "value": fdef["format_value"](value_match),
                    "conf": search_conf,
                    "errors": errors,
                })

        # keep only candidates that pass this field's sanity check, if any
        if fdef["validate"]:
            candidates = [c for c in candidates if fdef["validate"](c["value"])]

        best = min(candidates, key=lambda c: _score(c["errors"], c["conf"])) if candidates else None
        raw_values[fdef["field"]] = best["value"] if best else None

        if best:
            status = "valid" if best["conf"] >= LOW_CONFIDENCE_THRESHOLD else "low_confidence"
            results[fdef["field"]] = {
                "field": fdef["field"],
                "value": best["value"],
                "confidence": round(best["conf"], 1),
                "status": status,
            }
        else:
            results[fdef["field"]] = {
                "field": fdef["field"],
                "value": "—",
                "confidence": 0,
                "status": "missing",
            }

    # Cross-field sanity check: a "Batch No." that's identical to, or a
    # substring/superset of, the extracted FSSAI digits is almost always a
    # mis-attribution (both fields tend to be adjacent digit-ish runs on
    # crowded labels) rather than a genuine coincidence — drop it rather
    # than report a value we don't actually trust.
    batch_val = raw_values.get("Batch No.")
    fssai_val = raw_values.get("FSSAI License No.")
    if batch_val and fssai_val and (batch_val in fssai_val or fssai_val in batch_val):
        results["Batch No."] = {
            "field": "Batch No.",
            "value": "—",
            "confidence": 0,
            "status": "missing",
        }

    return [results[fdef["field"]] for fdef in FIELD_DEFS]