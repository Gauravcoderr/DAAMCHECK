"""
PaddleOCR local service — Pass 1 vision transcription fallback for DaamCheck.

Install:
  pip install paddlepaddle paddleocr flask opencv-python-headless numpy

Run:
  python server.py          # starts on port 8100

POST /ocr
  Body: { "imageBase64": "data:image/jpeg;base64,..." }
  Response: { "text": "raw transcribed text" }
"""

import base64
import sys
import numpy as np
import cv2
from flask import Flask, request, jsonify

try:
    from paddleocr import PaddleOCR
except ImportError:
    print("ERROR: paddleocr not installed. Run: pip install paddlepaddle paddleocr")
    sys.exit(1)

app = Flask(__name__)

# Initialize once — downloads models on first run (~300MB)
ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)


@app.route("/health")
def health():
    return jsonify({"ok": True})


@app.route("/ocr", methods=["POST"])
def run_ocr():
    data = request.get_json(silent=True) or {}
    image_b64: str = data.get("imageBase64", "")

    if not image_b64:
        return jsonify({"error": "imageBase64 required"}), 400

    # Strip data URL prefix if present
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
        result = ocr.ocr(img, cls=True)
    except Exception as e:
        return jsonify({"error": f"OCR failed: {e}"}), 500

    lines = []
    if result:
        for page in result:
            if not page:
                continue
            for item in page:
                if item and len(item) >= 2:
                    text = item[1][0] if isinstance(item[1], (list, tuple)) else str(item[1])
                    conf = item[1][1] if isinstance(item[1], (list, tuple)) and len(item[1]) > 1 else 1.0
                    if conf > 0.5:  # skip very low-confidence detections
                        lines.append(text)

    return jsonify({"text": "\n".join(lines)})


if __name__ == "__main__":
    port = 8100
    print(f"PaddleOCR service starting on http://localhost:{port}")
    print("First run will download models (~300MB) — wait for 'Ready'")
    app.run(host="0.0.0.0", port=port, debug=False)
