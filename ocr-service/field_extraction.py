"""
Extracts Legal Metrology fields from OCR'd text lines using fuzzy
label-proximity matching with candidate scoring and cross-field sanity
checks. Every returned field is either a real match with the confidence
PaddleOCR reported for that text, or explicitly "missing" — nothing here
fabricates a value or a confidence score.
"""
import re
import statistics
import regex  # supports fuzzy/approximate matching — pip install regex

LOW_CONFIDENCE_THRESHOLD = 30
MIN_PLAUSIBLE_MRP = 5  # real MRPs are essentially never below this; guards
                        # against a stray digit token being mistaken for one
ROW_TOLERANCE_RATIO = 1.0  # fraction of median line height allowed as
                            # vertical slack when pairing a label with a
                            # side-by-side value box in the same row.
                            # Widened from 0.8 after a real label showed a
                            # value box 53px from its label's center against
                            # a 48px tolerance — legitimately in the same
                            # row, just imprecisely typeset. This is shared
                            # across every field, not MRP-specific, so a
                            # wider net here means slightly more candidates
                            # considered everywhere, not just for MRP.
BELOW_ALIGN_RATIO = 1.5    # fraction of median line height allowed as
                            # horizontal slack when pairing a label with a
                            # stacked value box directly below it

_MONTH_NAMES = r"Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec"
_DATE_VALUE_RE = re.compile(
    r"(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}"
    rf"|(?:\d{{1,2}}\s*)?(?:{_MONTH_NAMES})[A-Za-z]*\.?\s*\d{{2,4}})",
    re.IGNORECASE,
)


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
        # Currency prefix is now REQUIRED, not optional. A bare number near
        # the MRP label (a year, a lot number, anything digit-shaped) used
        # to satisfy this regex with no currency symbol at all — that's how
        # "FEB2014" got misread as an MRP. Real MRPs are printed with Rs./₹/
        # INR; anything without one isn't a trustworthy MRP match.
        # Paise separator now also accepts a hyphen (Rs.29-00), which this
        # exact label uses, alongside the usual period/comma.
        "value_re": re.compile(r"(?:Rs\.?|₹|INR)\s?(\d{1,6}(?:[.,\-]\d{1,2})?)"),
        "format_value": lambda m: f"₹{m.group(1).replace(',', '.').replace('-', '.')}",
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
        "value_re": re.compile(r"\b([A-Z0-9][A-Z0-9\-/]{1,14})\b"),
        "format_value": lambda m: m.group(1),
        "validate": None,  # cross-checked against FSSAI after all fields extract
    },
    {
        "field": "Packed Date",
        "label_re": _fuzzy_label(["Pkd", "Packed on", "Packed date", "Mfg Date", "Manufacturing Date"], max_errors=2),
        "value_re": _DATE_VALUE_RE,
        "format_value": lambda m: m.group(1),
        "validate": None,
    },
    {
        "field": "Expiry Date",
        "label_re": _fuzzy_label(["Expiry", "Exp Date", "Use By", "Best Before"], max_errors=2),
        "value_re": _DATE_VALUE_RE,
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


def _has_geometry(lines: list[dict]) -> bool:
    """False when every box collapsed to (0,0,0,0) — no position data
    came back from the OCR engine, so spatial pairing can't work."""
    return any((l["max_x"] - l["min_x"]) > 0 or (l["max_y"] - l["min_y"]) > 0 for l in lines)


def _median_line_height(lines: list[dict]) -> float:
    heights = [l["max_y"] - l["min_y"] for l in lines]
    heights = [h for h in heights if h > 0]
    return statistics.median(heights) if heights else 20.0


def _same_row_value_lines(lines: list[dict], label_idx: int, own_label_re) -> list[dict]:
    """
    Lines positioned to the RIGHT of the label's own line, within roughly
    one line-height of vertical alignment — the side-by-side table
    layout (label column | value column). Excludes any line that matches
    a DIFFERENT field's label. Closest row-alignment first.
    """
    label_line = lines[label_idx]
    tol = _median_line_height(lines) * ROW_TOLERANCE_RATIO

    scored = []
    for j, line in enumerate(lines):
        if j == label_idx:
            continue
        if line["min_x"] <= label_line["max_x"]:
            continue  # not to the right of the label — wrong column
        if abs(line["cy"] - label_line["cy"]) > tol:
            continue  # not the same row
        claimed_by_other = any(
            fdef["label_re"] is not own_label_re and fdef["label_re"].search(line["text"])
            for fdef in FIELD_DEFS
        )
        if claimed_by_other:
            continue
        scored.append((abs(line["cy"] - label_line["cy"]), line))

    scored.sort(key=lambda s: s[0])
    return [s[1] for s in scored]


def _below_value_lines(lines: list[dict], label_idx: int, own_label_re) -> list[dict]:
    """
    Lines positioned directly BELOW the label's own line, roughly
    left-aligned with it — the stacked layout (label line, value line
    right underneath). Excludes any line that matches a DIFFERENT
    field's label. Closest line first.
    """
    label_line = lines[label_idx]
    tol = _median_line_height(lines) * BELOW_ALIGN_RATIO

    scored = []
    for j, line in enumerate(lines):
        if j == label_idx:
            continue
        if line["cy"] <= label_line["cy"]:
            continue  # not below
        if abs(line["min_x"] - label_line["min_x"]) > tol:
            continue  # not left-aligned with the label
        claimed_by_other = any(
            fdef["label_re"] is not own_label_re and fdef["label_re"].search(line["text"])
            for fdef in FIELD_DEFS
        )
        if claimed_by_other:
            continue
        scored.append((line["cy"] - label_line["cy"], line))

    scored.sort(key=lambda s: s[0])
    return [s[1] for s in scored]


def _candidate_lines(lines: list[dict], label_idx: int, own_label_re) -> list[dict]:
    """
    All plausible value-line candidates for a label, tried in priority
    order: same-row (side-by-side layout) first, then below (stacked
    layout). Empty if no geometry is available at all.
    """
    if not _has_geometry(lines):
        return []
    return (
        _same_row_value_lines(lines, label_idx, own_label_re)
        + _below_value_lines(lines, label_idx, own_label_re)
    )


def extract_fields(lines: list[dict]) -> list[dict]:
    """
    lines: [{"text": str, "conf": float, "min_x", "max_x", "min_y", "max_y", "cy"}, ...]

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
                if digits is None:
                    for cand_line in _candidate_lines(lines, i, fdef["label_re"]):
                        digits = _extract_fssai_digits(cand_line["text"])
                        if digits is not None:
                            conf = (line["conf"] + cand_line["conf"]) / 2
                            break
                if digits is not None:
                    candidates.append({"value": digits, "conf": conf, "errors": errors})
                continue

            if fdef["value_re"] is None:  # manufacturer-style: text after label
                remainder = line["text"][label_match.end():].strip(" :.-")
                if remainder:
                    candidates.append({"value": remainder, "conf": line["conf"], "errors": errors})
                    continue
                for cand_line in _candidate_lines(lines, i, fdef["label_re"]):
                    if cand_line["text"].strip():
                        candidates.append({
                            "value": cand_line["text"].strip(),
                            "conf": (line["conf"] + cand_line["conf"]) / 2,
                            "errors": errors,
                        })
                        break
                continue

            # Search only the text after the label on its own line first —
            # searching the whole line let a label like "LOT" satisfy its
            # own field's value pattern before the real value was found.
            value_match = fdef["value_re"].search(line["text"][label_match.end():])
            search_conf = line["conf"]

            if not value_match:
                for cand_line in _candidate_lines(lines, i, fdef["label_re"]):
                    m = fdef["value_re"].search(cand_line["text"])
                    if m:
                        value_match = m
                        search_conf = (line["conf"] + cand_line["conf"]) / 2
                        break

            if value_match:
                candidates.append({
                    "value": fdef["format_value"](value_match),
                    "conf": search_conf,
                    "errors": errors,
                })

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