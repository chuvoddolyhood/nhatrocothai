"""
FastAPI application for electricity meter digit reading.
"""
import os, sys, io, base64, time
from typing import Optional
from contextlib import asynccontextmanager

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import MODEL_PATH, DEFAULT_PREPROCESSING, YOLO_CONFIDENCE_THRESHOLD
from preprocessing import ImagePreprocessor
from postprocessing import PostProcessor

preprocessor = ImagePreprocessor(DEFAULT_PREPROCESSING)
postprocessor = PostProcessor()
detector = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global detector
    try:
        from detector import DigitDetector
        detector = DigitDetector()
        if detector.is_ready():
            print("✅ YOLOv8 model loaded!")
        else:
            print(f"⚠️  Model not found at {MODEL_PATH}. Run training first.")
    except Exception as e:
        print(f"⚠️  Model load failed: {e}")
    yield

app = FastAPI(title="Meter Reading API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ReadingResponse(BaseModel):
    meter_reading: str
    digits: list
    confidence: float
    is_valid: bool
    rejection_reason: str
    bounding_boxes: list
    processing_time_ms: float
    annotated_image_base64: Optional[str] = None

@app.get("/")
async def health():
    return {"status": "running", "model_loaded": detector is not None and detector.is_ready()}

@app.post("/api/read-meter", response_model=ReadingResponse)
async def read_meter(
    image: UploadFile = File(...),
    confidence: float = Form(default=YOLO_CONFIDENCE_THRESHOLD),
    previous_reading: Optional[str] = Form(default=None),
    include_annotated: bool = Form(default=True),
):
    if detector is None or not detector.is_ready():
        raise HTTPException(status_code=503, detail="Model not loaded. Train first.")

    start = time.time()
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    preprocessed = preprocessor.preprocess(img)

    if include_annotated:
        detections, annotated = detector.detect_and_visualize(preprocessed, confidence)
    else:
        detections = detector.detect(preprocessed, confidence)
        annotated = None

    reading = postprocessor.process(detections, previous_reading)
    if reading.is_valid:
        postprocessor.add_to_history(reading.reading)

    ms = (time.time() - start) * 1000
    ann_b64 = None
    if annotated is not None:
        _, buf = cv2.imencode('.jpg', annotated, [cv2.IMWRITE_JPEG_QUALITY, 85])
        ann_b64 = base64.b64encode(buf).decode()

    return ReadingResponse(
        meter_reading=reading.reading, digits=reading.digits,
        confidence=reading.confidence, is_valid=reading.is_valid,
        rejection_reason=reading.rejection_reason,
        bounding_boxes=reading.bounding_boxes,
        processing_time_ms=round(ms, 2), annotated_image_base64=ann_b64,
    )

@app.post("/api/preprocess")
async def preprocess_image(image: UploadFile = File(...)):
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image")
    preprocessed = preprocessor.preprocess(img)
    _, buf = cv2.imencode('.jpg', preprocessed, [cv2.IMWRITE_JPEG_QUALITY, 90])
    return StreamingResponse(io.BytesIO(buf.tobytes()), media_type="image/jpeg")

@app.get("/api/voted-reading")
async def voted_reading():
    return {"voted_reading": postprocessor.get_voted_reading(), "history": postprocessor.reading_history}

@app.post("/api/reset-history")
async def reset_history():
    postprocessor.reading_history.clear()
    return {"status": "cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
