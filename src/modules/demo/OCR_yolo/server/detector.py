"""
YOLOv8 digit detection module.
Detects individual digits (digit_0 through digit_9) with bounding boxes.
"""
import os
import numpy as np
import cv2
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field
from config import (
    MODEL_PATH, YOLO_CONFIDENCE_THRESHOLD, YOLO_IOU_THRESHOLD,
    YOLO_IMG_SIZE, DIGIT_CLASSES
)


@dataclass
class DetectedDigit:
    """Represents a single detected digit."""
    digit: int          # 0-9
    confidence: float   # Detection confidence score
    x_center: float     # Bounding box center X (normalized)
    y_center: float     # Bounding box center Y (normalized)
    width: float        # Bounding box width (normalized)
    height: float       # Bounding box height (normalized)
    x_min: int = 0      # Pixel coordinates
    y_min: int = 0
    x_max: int = 0
    y_max: int = 0
    class_name: str = ""

    def __post_init__(self):
        self.class_name = f"digit_{self.digit}"


class DigitDetector:
    """
    YOLOv8-based digit detector.
    Loads a trained YOLOv8 model and detects individual digits in meter images.
    """

    def __init__(self, model_path: Optional[str] = None, confidence: float = YOLO_CONFIDENCE_THRESHOLD):
        self.model_path = model_path or MODEL_PATH
        self.confidence = confidence
        self.model = None
        self._load_model()

    def _load_model(self):
        """Load the YOLOv8 model."""
        try:
            from ultralytics import YOLO
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                print(f"[DigitDetector] Model loaded from: {self.model_path}")
            else:
                # Use a pretrained nano model for initial setup
                print(f"[DigitDetector] WARNING: Model not found at {self.model_path}")
                print(f"[DigitDetector] Please train a model first using training/train.py")
                self.model = None
        except ImportError:
            print("[DigitDetector] ERROR: ultralytics not installed. Run: pip install ultralytics")
            self.model = None

    def detect(self, image: np.ndarray, confidence: Optional[float] = None) -> List[DetectedDigit]:
        """
        Detect digits in the image.

        Args:
            image: BGR image (OpenCV format)
            confidence: Override confidence threshold

        Returns:
            List of DetectedDigit objects sorted by x_center (left to right)
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Train a model first.")

        conf = confidence or self.confidence
        h, w = image.shape[:2]

        # Run inference
        results = self.model.predict(
            source=image,
            conf=conf,
            iou=YOLO_IOU_THRESHOLD,
            imgsz=YOLO_IMG_SIZE,
            verbose=False
        )

        detected_digits = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            for i in range(len(boxes)):
                cls_id = int(boxes.cls[i].item())
                conf_score = float(boxes.conf[i].item())

                # Get pixel coordinates
                x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy()
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)

                # Normalized center coordinates
                cx = (x1 + x2) / 2 / w
                cy = (y1 + y2) / 2 / h
                bw = (x2 - x1) / w
                bh = (y2 - y1) / h

                digit = DetectedDigit(
                    digit=cls_id,
                    confidence=conf_score,
                    x_center=cx,
                    y_center=cy,
                    width=bw,
                    height=bh,
                    x_min=x1,
                    y_min=y1,
                    x_max=x2,
                    y_max=y2,
                )
                detected_digits.append(digit)

        # Sort by x_center (left to right)
        detected_digits.sort(key=lambda d: d.x_center)

        return detected_digits

    def detect_and_visualize(self, image: np.ndarray, confidence: Optional[float] = None) -> tuple:
        """
        Detect digits and return annotated image.

        Returns:
            (detected_digits, annotated_image)
        """
        digits = self.detect(image, confidence)
        annotated = image.copy()

        colors = [
            (0, 255, 0), (255, 0, 0), (0, 0, 255), (255, 255, 0),
            (255, 0, 255), (0, 255, 255), (128, 255, 0), (0, 128, 255),
            (255, 128, 0), (128, 0, 255)
        ]

        for digit in digits:
            color = colors[digit.digit % len(colors)]

            # Draw bounding box
            cv2.rectangle(
                annotated,
                (digit.x_min, digit.y_min),
                (digit.x_max, digit.y_max),
                color, 2
            )

            # Draw label
            label = f"{digit.digit} ({digit.confidence:.2f})"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]

            cv2.rectangle(
                annotated,
                (digit.x_min, digit.y_min - label_size[1] - 8),
                (digit.x_min + label_size[0] + 4, digit.y_min),
                color, -1
            )
            cv2.putText(
                annotated, label,
                (digit.x_min + 2, digit.y_min - 4),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1
            )

        return digits, annotated

    def is_ready(self) -> bool:
        """Check if the model is loaded and ready."""
        return self.model is not None
