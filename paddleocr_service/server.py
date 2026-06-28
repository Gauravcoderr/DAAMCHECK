"""
OCR service for DaamCheck — Pass 1 vision transcription fallback.
Uses EasyOCR (CPU, no GPU required).

Install:
  pip install easyocr flask gunicorn opencv-python-headless numpy

Run locally:
  python server.py          # starts on port 8100

Production (Render):
  gunicorn server:app --bind 0.0.0.0:$PORT --timeout 120 --workers 1

POST /ocr
  Body: { "imageBase64": "<raw base64 or data URI>" }
  Response: { "text": "raw transcribed text" }
"""

import base64
import os
import sys
import numpy as np
import cv2
from flask import Flask, request, jsonify

try:
    import easyocr
except ImportError:
    print("ERROR: easyocr not installed. Run: pip install easyocr")
    sys.exit(1)

app = Flask(__name__)

# Lazy-init: models download on first OCR request, not at startup.
# This lets gunicorn open the port immediately so Render doesn't time out.
_reader = None

def get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(["en"], gpu=False, verbose=False)
    return _reader


@app.route("/health")
def health():
    return jsonify({"ok": True})


@app.route("/ocr", methods=["POST"])
def run_ocr():
    data = request.get_json(silent=True) or {}
    image_b64: str = data.get("imageBase64", "")

    if not image_b64:
        return jsonify({"error": "imageBase64 required"}), 400

    # Strip data URI prefix if present
    if "," in image_b64:
        image_b64 = image_b64.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(image_b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({"error": "Could not decode image"}), 400
    except Exception as e:
        return jsonify({"error": f"Image decode failed: {e}"}), 400

    try:
        results = get_reader().readtext(img, detail=1)
    except Exception as e:
        return jsonify({"error": f"OCR failed: {e}"}), 500

    lines = [text for (_, text, conf) in results if conf > 0.5]
    return jsonify({"text": "\n".join(lines)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8100))
    print(f"OCR service starting on http://localhost:{port}")
    print("First run downloads EasyOCR models (~100MB) — wait for 'Ready'")
    app.run(host="0.0.0.0", port=port, debug=False)
