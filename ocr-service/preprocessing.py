"""
Image preprocessing to improve PaddleOCR accuracy on product package photos.

Unlike Tesseract, PaddleOCR's detection and recognition models are
deep-learning-based and were trained on natural (non-binarized) images —
feeding them a hard-thresholded black/white image (which helped Tesseract)
tends to destroy texture and gradient information the models actually use,
and hurts accuracy rather than helping it. So this preprocessing stops
short of binarization: upscale, denoise, then boost local contrast — and
hand PaddleOCR a color image, not a binary mask.

Real transforms only — no synthetic/placeholder logic.
"""
import cv2
import numpy as np
from PIL import Image


def preprocess_image(pil_image: Image.Image) -> np.ndarray:
    """
    Takes a PIL image (as uploaded), returns a cleaned-up BGR OpenCV image
    ready for PaddleOCR's .predict().
    """
    img = cv2.cvtColor(np.array(pil_image.convert("RGB")), cv2.COLOR_RGB2BGR)

    # Upscale small images — recognition accuracy on small text drops
    # sharply below ~1000px on the shorter side.
    h, w = img.shape[:2]
    shorter_side = min(h, w)
    if shorter_side < 1000:
        scale = 1000 / shorter_side
        img = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    # Denoise lightly — package photos often carry JPEG artifacts, but
    # heavy denoising blurs the fine edges the recognition model relies
    # on, so this uses a gentler filter strength than the old
    # Tesseract-oriented pass did.
    denoised = cv2.fastNlMeansDenoisingColored(img, h=6, hColor=6)

    # CLAHE (contrast-limited adaptive histogram equalization) on the
    # lightness channel only, in LAB space — evens out uneven lighting
    # and mild glare across a package's surface without blowing out
    # colour or introducing the hard edges a global threshold would.
    lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_equalized = clahe.apply(l_channel)
    lab_equalized = cv2.merge((l_equalized, a_channel, b_channel))
    result = cv2.cvtColor(lab_equalized, cv2.COLOR_LAB2BGR)

    return result