"""
Integration test for the meter reading pipeline.
Tests preprocessing, detection (mock), and post-processing.
"""
import os
import sys
import numpy as np
import cv2

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'server'))

from preprocessing import ImagePreprocessor
from postprocessing import PostProcessor, MeterReading
from detector import DetectedDigit


def test_preprocessor():
    """Test OpenCV preprocessing pipeline."""
    print("Testing ImagePreprocessor...")
    img = np.random.randint(0, 255, (200, 640, 3), dtype=np.uint8)
    prep = ImagePreprocessor()

    result = prep.preprocess(img)
    assert result is not None
    assert len(result.shape) == 3
    print("  ✅ Basic preprocessing passed")

    result = prep.preprocess(img, {"sharpen": True, "denoise": True, "contrast_alpha": 1.5})
    assert result is not None
    print("  ✅ Preprocessing with options passed")

    gray = prep.preprocess_for_grayscale_analysis(img)
    assert len(gray.shape) == 2
    print("  ✅ Grayscale analysis passed")


def test_postprocessor():
    """Test digit sorting and validation."""
    print("\nTesting PostProcessor...")
    pp = PostProcessor(min_digits=3, max_digits=8)

    detections = [
        DetectedDigit(digit=8, confidence=0.95, x_center=0.8, y_center=0.5, width=0.1, height=0.5, x_min=480, y_min=20, x_max=560, y_max=180),
        DetectedDigit(digit=1, confidence=0.92, x_center=0.2, y_center=0.5, width=0.1, height=0.5, x_min=80, y_min=20, x_max=160, y_max=180),
        DetectedDigit(digit=2, confidence=0.88, x_center=0.4, y_center=0.5, width=0.1, height=0.5, x_min=240, y_min=20, x_max=320, y_max=180),
        DetectedDigit(digit=4, confidence=0.91, x_center=0.5, y_center=0.5, width=0.1, height=0.5, x_min=320, y_min=20, x_max=400, y_max=180),
        DetectedDigit(digit=5, confidence=0.87, x_center=0.6, y_center=0.5, width=0.1, height=0.5, x_min=400, y_min=20, x_max=480, y_max=180),
    ]

    reading = pp.process(detections)
    assert reading.reading == "12458"
    assert reading.is_valid
    assert reading.confidence > 0.8
    print(f"  ✅ Sort & assemble: {reading.reading} (conf: {reading.confidence:.3f})")

    # Test: too few digits
    short = detections[:2]
    r = pp.process(short)
    assert not r.is_valid
    print(f"  ✅ Too few digits rejected: {r.rejection_reason}")

    # Test: previous reading check
    r = pp.process(detections, previous_reading="99999")
    assert not r.is_valid
    print(f"  ✅ Decreasing reading rejected: {r.rejection_reason}")


def test_voting():
    """Test multi-frame voting."""
    print("\nTesting Voting Logic...")
    pp = PostProcessor()

    readings = ["12458", "12458", "12459", "12458"]
    voted = pp.vote_reading(readings)
    assert voted == "12458"
    print(f"  ✅ Voting result: {voted} (from {readings})")


def test_overlap_removal():
    """Test duplicate/overlap removal."""
    print("\nTesting Overlap Removal...")
    pp = PostProcessor()

    d1 = DetectedDigit(digit=5, confidence=0.95, x_center=0.5, y_center=0.5, width=0.1, height=0.5, x_min=300, y_min=20, x_max=380, y_max=180)
    d2 = DetectedDigit(digit=3, confidence=0.80, x_center=0.51, y_center=0.5, width=0.1, height=0.5, x_min=305, y_min=20, x_max=385, y_max=180)

    result = pp._remove_overlaps([d1, d2], iou_threshold=0.3)
    assert len(result) == 1
    assert result[0].digit == 5
    print(f"  ✅ Overlap removed: kept digit {result[0].digit} (higher confidence)")


if __name__ == "__main__":
    print("=" * 50)
    print("Running Meter Reading Pipeline Tests")
    print("=" * 50)
    test_preprocessor()
    test_postprocessor()
    test_voting()
    test_overlap_removal()
    print("\n" + "=" * 50)
    print("All tests passed! ✅")
    print("=" * 50)
