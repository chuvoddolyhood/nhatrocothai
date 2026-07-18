# backend/requirements.txt
fastapi
uvicorn
python-multipart
opencv-python
pytesseract  # Wrapper cho Tesseract
pillow
ultralytics  # YOLOv8
numpy

# Cần cài Tesseract riêng: https://github.com/UB-Mannheim/tesseract/wiki

# backend/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import cv2
import pytesseract
from ultralytics import YOLO
import numpy as np
from PIL import Image
import io

app = FastAPI()
model = YOLO("yolov8n.pt")  # Load YOLO model

@app.post("/api/ocr/detect-and-extract")
async def detect_and_extract(front: UploadFile, back: UploadFile):
    """
    - Detect thẻ CCCD có hợp lệ không
    - Extract text từ ảnh
    """
    try:
        front_image = Image.open(io.BytesIO(await front.read()))
        back_image = Image.open(io.BytesIO(await back.read()))

        # Detection
        front_detection = model.predict(front_image)
        back_detection = model.predict(back_image)

        # OCR
        front_text = pytesseract.image_to_string(front_image, lang='vie')
        back_text = pytesseract.image_to_string(back_image, lang='vie')

        # Parse & Extract fields
        data = parse_cccd_text(front_text, back_text)

        return {
            "success": True,
            "data": data,
            "confidence": {
                "front": float(front_detection[0].boxes.conf.mean()) if front_detection[0].boxes else 0,
                "back": float(back_detection[0].boxes.conf.mean()) if back_detection[0].boxes else 0
            }
        }
    except Exception as e:
        return JSONResponse(status_code=400, content={"success": False, "error": str(e)})

def parse_cccd_text(front_text: str, back_text: str) -> dict:
    """Parse OCR text thành structured data"""
    # Extract từng field (tên, số CCCD, ngày sinh, địa chỉ)
    # Sử dụng regex patterns hoặc NLP
    pass
