"""
Post-processing module for meter reading:
- Sort detected digits by X coordinate (left to right)
- Assemble digits into a complete reading string
- Validation logic (confidence, consistency, voting)
"""
from typing import List, Optional, Dict, Any
from collections import Counter
from dataclasses import dataclass
from detector import DetectedDigit
from config import (
    MIN_CONFIDENCE, MIN_DIGITS, MAX_DIGITS,
    REJECT_IF_AVG_CONFIDENCE_BELOW, VOTING_WINDOW_SIZE
)


@dataclass
class MeterReading:
    """Result of meter reading extraction."""
    reading: str               # The final meter reading string
    digits: List[int]          # Individual digits
    confidence: float          # Average confidence score
    individual_confidences: List[float]
    is_valid: bool             # Whether the reading passed validation
    rejection_reason: str      # Reason for rejection if invalid
    raw_detections: int        # Number of raw detections before filtering
    bounding_boxes: List[Dict[str, Any]]  # Bounding box info for visualization

    def to_dict(self) -> Dict[str, Any]:
        return {
            "meter_reading": self.reading,
            "digits": self.digits,
            "confidence": round(self.confidence, 4),
            "individual_confidences": [round(c, 4) for c in self.individual_confidences],
            "is_valid": self.is_valid,
            "rejection_reason": self.rejection_reason,
            "raw_detections": self.raw_detections,
            "bounding_boxes": self.bounding_boxes,
        }


class PostProcessor:
    """
    Post-processing pipeline for digit detections.
    Sorts digits, validates reading, and supports multi-frame voting.
    """

    def __init__(
        self,
        min_confidence: float = MIN_CONFIDENCE,
        min_digits: int = MIN_DIGITS,
        max_digits: int = MAX_DIGITS,
        avg_confidence_threshold: float = REJECT_IF_AVG_CONFIDENCE_BELOW
    ):
        self.min_confidence = min_confidence
        self.min_digits = min_digits
        self.max_digits = max_digits
        self.avg_confidence_threshold = avg_confidence_threshold
        self.reading_history: List[str] = []  # For multi-frame voting

    def process(self, detections: List[DetectedDigit], previous_reading: Optional[str] = None) -> MeterReading:
        """
        Process raw detections into a validated meter reading.

        Args:
            detections: List of DetectedDigit from YOLO
            previous_reading: Previous meter reading for consistency validation

        Returns:
            MeterReading with validation status
        """
        raw_count = len(detections)

        # Step 1: Filter by confidence
        filtered = [d for d in detections if d.confidence >= self.min_confidence]

        # Step 2: Remove overlapping detections (NMS-like, keep highest confidence)
        filtered = self._remove_overlaps(filtered)

        # Step 3: Sort by X coordinate (left to right)
        filtered.sort(key=lambda d: d.x_center)

        # Step 4: Extract digits and confidences
        digits = [d.digit for d in filtered]
        confidences = [d.confidence for d in filtered]
        bboxes = [
            {
                "digit": d.digit,
                "confidence": round(d.confidence, 4),
                "bbox": [d.x_min, d.y_min, d.x_max, d.y_max],
                "class_name": d.class_name,
            }
            for d in filtered
        ]

        # Step 5: Validate
        reading_str = "".join(str(d) for d in digits)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
        is_valid = True
        rejection_reason = ""

        # Validation checks
        if len(digits) < self.min_digits:
            is_valid = False
            rejection_reason = f"Too few digits detected: {len(digits)} (minimum: {self.min_digits})"
        elif len(digits) > self.max_digits:
            is_valid = False
            rejection_reason = f"Too many digits detected: {len(digits)} (maximum: {self.max_digits})"
        elif avg_conf < self.avg_confidence_threshold:
            is_valid = False
            rejection_reason = f"Average confidence too low: {avg_conf:.3f} (threshold: {self.avg_confidence_threshold})"
        elif previous_reading and reading_str:
            # Check that new reading is not less than previous
            try:
                new_val = int(reading_str)
                old_val = int(previous_reading)
                if new_val < old_val:
                    is_valid = False
                    rejection_reason = f"New reading ({reading_str}) is less than previous ({previous_reading})"
            except ValueError:
                pass

        return MeterReading(
            reading=reading_str,
            digits=digits,
            confidence=avg_conf,
            individual_confidences=confidences,
            is_valid=is_valid,
            rejection_reason=rejection_reason,
            raw_detections=raw_count,
            bounding_boxes=bboxes,
        )

    def vote_reading(self, readings: List[str]) -> str:
        """
        Multi-frame voting: pick the most common reading from recent frames.

        Example:
            ["12458", "12458", "12459", "12458"] => "12458"

        Args:
            readings: List of reading strings from multiple frames

        Returns:
            Most common reading string
        """
        if not readings:
            return ""

        # Use most recent N readings
        recent = readings[-VOTING_WINDOW_SIZE:]
        counter = Counter(recent)
        most_common = counter.most_common(1)[0][0]
        return most_common

    def add_to_history(self, reading: str):
        """Add a reading to the history for voting."""
        self.reading_history.append(reading)
        # Keep only recent readings
        if len(self.reading_history) > VOTING_WINDOW_SIZE * 2:
            self.reading_history = self.reading_history[-VOTING_WINDOW_SIZE:]

    def get_voted_reading(self) -> str:
        """Get the voted reading from history."""
        return self.vote_reading(self.reading_history)

    def _remove_overlaps(self, detections: List[DetectedDigit], iou_threshold: float = 0.5) -> List[DetectedDigit]:
        """
        Remove overlapping detections, keeping the one with highest confidence.
        Simple NMS-like approach.
        """
        if len(detections) <= 1:
            return detections

        # Sort by confidence (descending)
        sorted_dets = sorted(detections, key=lambda d: d.confidence, reverse=True)
        keep = []

        while sorted_dets:
            best = sorted_dets.pop(0)
            keep.append(best)

            remaining = []
            for det in sorted_dets:
                if self._compute_iou(best, det) < iou_threshold:
                    remaining.append(det)
            sorted_dets = remaining

        return keep

    def _compute_iou(self, a: DetectedDigit, b: DetectedDigit) -> float:
        """Compute Intersection over Union between two detections."""
        x1 = max(a.x_min, b.x_min)
        y1 = max(a.y_min, b.y_min)
        x2 = min(a.x_max, b.x_max)
        y2 = min(a.y_max, b.y_max)

        intersection = max(0, x2 - x1) * max(0, y2 - y1)
        area_a = (a.x_max - a.x_min) * (a.y_max - a.y_min)
        area_b = (b.x_max - b.x_min) * (b.y_max - b.y_min)
        union = area_a + area_b - intersection

        return intersection / union if union > 0 else 0.0
