"""
Synthetic dataset generator for training YOLOv8 digit detection.
Generates realistic mechanical meter images with YOLO-format labels.
"""
import os
import sys
import random
import math
import numpy as np
import cv2
from pathlib import Path

# Project paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(SCRIPT_DIR, "dataset")
IMAGES_TRAIN = os.path.join(DATASET_DIR, "images", "train")
IMAGES_VAL = os.path.join(DATASET_DIR, "images", "val")
LABELS_TRAIN = os.path.join(DATASET_DIR, "labels", "train")
LABELS_VAL = os.path.join(DATASET_DIR, "labels", "val")

for d in [IMAGES_TRAIN, IMAGES_VAL, LABELS_TRAIN, LABELS_VAL]:
    os.makedirs(d, exist_ok=True)


class MeterImageGenerator:
    """Generates synthetic mechanical meter images with labeled digits."""

    # Fonts that look like mechanical meter digits
    FONT_FACES = [
        cv2.FONT_HERSHEY_SIMPLEX,
        cv2.FONT_HERSHEY_DUPLEX,
        cv2.FONT_HERSHEY_TRIPLEX,
    ]

    def __init__(self, img_width=640, img_height=200):
        self.img_width = img_width
        self.img_height = img_height

    def generate(self, num_digits=5):
        """Generate one meter image with annotations."""
        digits = [random.randint(0, 9) for _ in range(num_digits)]
        img = np.zeros((self.img_height, self.img_width, 3), dtype=np.uint8)

        # Random meter casing background
        bg_type = random.choice(["dark_metal", "light_panel", "gradient"])
        img = self._draw_background(img, bg_type)

        # Calculate digit cell dimensions
        margin_x = random.randint(40, 80)
        margin_y = random.randint(20, 40)
        usable_w = self.img_width - 2 * margin_x
        usable_h = self.img_height - 2 * margin_y
        cell_w = usable_w // num_digits
        cell_h = usable_h

        # Draw digit display area (the odometer window)
        display_x = margin_x
        display_y = margin_y
        display_w = cell_w * num_digits
        display_h = cell_h

        # Draw display background
        display_bg = random.choice([(255, 255, 255), (240, 240, 240), (220, 220, 220), (10, 10, 10)])
        cv2.rectangle(img, (display_x, display_y), (display_x + display_w, display_y + display_h), display_bg, -1)
        cv2.rectangle(img, (display_x, display_y), (display_x + display_w, display_y + display_h), (80, 80, 80), 2)

        annotations = []
        font_face = random.choice(self.FONT_FACES)
        font_scale = random.uniform(1.8, 2.8)
        font_thickness = random.randint(2, 4)

        for i, digit in enumerate(digits):
            cx = display_x + i * cell_w + cell_w // 2
            cy = display_y + cell_h // 2

            # Individual cell background (some meters have alternating colors)
            is_decimal = (i >= num_digits - random.choice([0, 1]))
            if is_decimal and random.random() > 0.3:
                cell_bg = (0, 0, random.randint(180, 220))  # Red for decimal
            else:
                cell_bg = display_bg
                is_decimal = False

            cv2.rectangle(img,
                (display_x + i * cell_w + 1, display_y + 1),
                (display_x + (i + 1) * cell_w - 1, display_y + display_h - 1),
                cell_bg, -1)

            # Cell border
            cv2.line(img,
                (display_x + (i + 1) * cell_w, display_y),
                (display_x + (i + 1) * cell_w, display_y + display_h),
                (120, 120, 120), 1)

            # Digit color
            if is_decimal:
                digit_color = (255, 255, 255)
            elif display_bg[0] > 128:
                digit_color = (random.randint(0, 30), random.randint(0, 30), random.randint(0, 30))
            else:
                digit_color = (random.randint(220, 255), random.randint(220, 255), random.randint(220, 255))

            # Random slight vertical offset (simulating wheel rotation)
            y_offset = random.randint(-3, 5) if random.random() > 0.7 else 0

            text = str(digit)
            text_size = cv2.getTextSize(text, font_face, font_scale, font_thickness)[0]
            text_x = cx - text_size[0] // 2
            text_y = cy + text_size[1] // 2 + y_offset

            cv2.putText(img, text, (text_x, text_y), font_face, font_scale, digit_color, font_thickness)

            # Center line (mechanical meter divider)
            if random.random() > 0.5:
                cv2.line(img,
                    (display_x + i * cell_w, display_y + display_h // 2),
                    (display_x + (i + 1) * cell_w, display_y + display_h // 2),
                    (180, 180, 180), 1)

            # Compute YOLO annotation (normalized)
            bbox_x = display_x + i * cell_w + 2
            bbox_y = display_y + 2
            bbox_w = cell_w - 4
            bbox_h = display_h - 4

            # Normalize to [0, 1]
            nx = (bbox_x + bbox_w / 2) / self.img_width
            ny = (bbox_y + bbox_h / 2) / self.img_height
            nw = bbox_w / self.img_width
            nh = bbox_h / self.img_height

            annotations.append((digit, nx, ny, nw, nh))

        # Apply random augmentations
        img = self._augment(img)

        return img, annotations

    def _draw_background(self, img, bg_type):
        h, w = img.shape[:2]
        if bg_type == "dark_metal":
            base = random.randint(20, 60)
            img[:] = (base, base, base)
            noise = np.random.randint(-10, 10, img.shape, dtype=np.int16)
            img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
        elif bg_type == "light_panel":
            base = random.randint(180, 230)
            img[:] = (base, base, base)
        else:  # gradient
            for y in range(h):
                ratio = y / h
                c = int(30 + 40 * ratio)
                img[y, :] = (c, c, c)
        return img

    def _augment(self, img):
        # Random brightness variation
        if random.random() > 0.5:
            factor = random.uniform(0.6, 1.4)
            img = cv2.convertScaleAbs(img, alpha=factor, beta=random.randint(-20, 20))

        # Random blur (simulate camera blur)
        if random.random() > 0.6:
            ksize = random.choice([3, 5])
            img = cv2.GaussianBlur(img, (ksize, ksize), 0)

        # Random noise
        if random.random() > 0.5:
            noise = np.random.normal(0, random.randint(3, 15), img.shape).astype(np.int16)
            img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

        # Random rotation (slight tilt)
        if random.random() > 0.5:
            angle = random.uniform(-5, 5)
            h, w = img.shape[:2]
            M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
            img = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REPLICATE)

        # Glass reflection / glare overlay
        if random.random() > 0.6:
            overlay = img.copy()
            h, w = img.shape[:2]
            sx = random.randint(0, w // 2)
            sy = random.randint(0, h // 3)
            ex = sx + random.randint(w // 4, w // 2)
            ey = sy + random.randint(h // 4, h // 2)
            cv2.rectangle(overlay, (sx, sy), (ex, ey), (255, 255, 255), -1)
            alpha = random.uniform(0.05, 0.2)
            img = cv2.addWeighted(overlay, alpha, img, 1 - alpha, 0)

        return img


def generate_dataset(num_train=2000, num_val=400):
    """Generate full training dataset."""
    gen = MeterImageGenerator()

    print(f"Generating {num_train} training images...")
    for i in range(num_train):
        num_d = random.choice([4, 5, 5, 5, 6, 6, 7])
        img, anns = gen.generate(num_digits=num_d)

        fname = f"meter_{i:05d}"
        cv2.imwrite(os.path.join(IMAGES_TRAIN, f"{fname}.jpg"), img)

        with open(os.path.join(LABELS_TRAIN, f"{fname}.txt"), "w") as f:
            for cls, x, y, w, h in anns:
                f.write(f"{cls} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")

        if (i + 1) % 500 == 0:
            print(f"  Training: {i + 1}/{num_train}")

    print(f"Generating {num_val} validation images...")
    for i in range(num_val):
        num_d = random.choice([4, 5, 5, 5, 6, 6, 7])
        img, anns = gen.generate(num_digits=num_d)

        fname = f"meter_{i:05d}"
        cv2.imwrite(os.path.join(IMAGES_VAL, f"{fname}.jpg"), img)

        with open(os.path.join(LABELS_VAL, f"{fname}.txt"), "w") as f:
            for cls, x, y, w, h in anns:
                f.write(f"{cls} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")

        if (i + 1) % 100 == 0:
            print(f"  Validation: {i + 1}/{num_val}")

    print(f"\n✅ Dataset generated!")
    print(f"   Train: {num_train} images in {IMAGES_TRAIN}")
    print(f"   Val:   {num_val} images in {IMAGES_VAL}")


if __name__ == "__main__":
    n_train = int(sys.argv[1]) if len(sys.argv) > 1 else 2000
    n_val = int(sys.argv[2]) if len(sys.argv) > 2 else 400
    generate_dataset(n_train, n_val)
