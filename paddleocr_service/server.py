"""
OCR service for DaamCheck — Pass 1 vision transcription fallback.
Uses Tesseract via pytesseract (~80MB RAM, no PyTorch).

Install:
  apt install tesseract-ocr tesseract-ocr-eng
  pip install pytesseract Pillow flask gunicorn opencv-python-headless numpy

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
    import pytesseract
    from PIL import Image
except ImportError:
    print("ERROR: pytesseract/Pillow not installed. Run: pip install pytesseract Pillow")
    sys.exit(1)

app = Flask(__name__)


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
        img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_cv is None:
            return jsonify({"error": "Could not decode image"}), 400
        # Convert BGR→RGB for Pillow
        img_pil = Image.fromarray(cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB))
    except Exception as e:
        return jsonify({"error": f"Image decode failed: {e}"}), 400

    try:
        # --psm 6: assume uniform block of text (good for receipts/bills)
        # --oem 3: default OCR engine (LSTM)
        text = pytesseract.image_to_string(img_pil, config="--psm 6 --oem 3")
    except Exception as e:
        return jsonify({"error": f"OCR failed: {e}"}), 500

    return jsonify({"text": text.strip()})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8100))
    print(f"OCR service starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
