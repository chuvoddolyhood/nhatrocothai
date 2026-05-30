"""
Configuration constants for the meter reading system.
"""
import os

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
MODEL_DIR = os.path.join(BASE_DIR, "models")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

# Model settings
MODEL_PATH = os.path.join(MODEL_DIR, "best.pt")
YOLO_CONFIDENCE_THRESHOLD = 0.25
YOLO_IOU_THRESHOLD = 0.45
YOLO_IMG_SIZE = 640

# Digit classes
DIGIT_CLASSES = [f"digit_{i}" for i in range(10)]
NUM_CLASSES = len(DIGIT_CLASSES)

# Preprocessing defaults
DEFAULT_PREPROCESSING = {
    "grayscale": True,
    "denoise": True,
    "denoise_strength": 10,
    "contrast_alpha": 1.5,
    "brightness_beta": 0,
    "sharpen": True,
    "adaptive_threshold": False,
    "adaptive_block_size": 11,
    "adaptive_c": 2,
    "resize_width": 640,
}

# Validation settings
MIN_CONFIDENCE = 0.3
MIN_DIGITS = 3
MAX_DIGITS = 8
REJECT_IF_AVG_CONFIDENCE_BELOW = 0.4

# Voting (multi-frame)
VOTING_WINDOW_SIZE = 5

# Ensure directories exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
