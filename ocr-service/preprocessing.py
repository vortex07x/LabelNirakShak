# ocr-service/preprocessing.py
"""
Image preprocessing to improve Tesseract accuracy on product package photos.
Real transforms only — no synthetic/placeholder logic.
"""
import cv2
import numpy as np
from PIL import Image


def preprocess_image(pil_image: Image.Image) -> np.ndarray:
    """
    Takes a PIL image (as uploaded), returns a cleaned-up OpenCV image
    ready for Tesseract.
    """
    img = cv2.cvtColor(np.array(pil_image.convert("RGB")), cv2.COLOR_RGB2BGR)

    # Upscale small images — Tesseract accuracy drops sharply below ~300 DPI
    # equivalent. If the shorter side is under 1000px, scale up.
    h, w = img.shape[:2]
    shorter_side = min(h, w)
    if shorter_side < 1000:
        scale = 1000 / shorter_side
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Denoise before thresholding — package photos often have JPEG artifacts
    denoised = cv2.fastNlMeansDenoising(gray, h=10)

    # Otsu's threshold picks a single global cutoff from the image's own
    # histogram, which tends to hold up better than a fixed-block adaptive
    # threshold on real photos with skew/glare (adaptiveThreshold was
    # turning marginal text into noise on angled, glossy packaging).
    _, thresh = cv2.threshold(
        denoised, 0, 255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )

    return thresh