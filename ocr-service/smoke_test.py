from paddleocr import PaddleOCR

ocr = PaddleOCR(
    use_textline_orientation=True,   # replaces the deprecated use_angle_cls
    lang="en",
    use_doc_orientation_classify=False,  # skip — irrelevant for package photos
    use_doc_unwarping=False,             # skip — meant for scanned pages, not packages
    enable_mkldnn=False,                 # <- this is what avoids the crash
)
result = ocr.predict("test_images/real-label.jpg")

res = result[0]
print("Type:", type(res))
print("Has .get()?", hasattr(res, "get"))
print("Keys available:", list(res.keys()) if hasattr(res, "keys") else "not dict-like")
print()
print("Full result:")
print(res)