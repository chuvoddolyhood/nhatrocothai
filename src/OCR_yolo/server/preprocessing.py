"""
OpenCV image preprocessing pipeline for meter digit detection.
Handles: grayscale, denoise, threshold, sharpen, perspective correction, adaptive threshold.
"""
import cv2
import numpy as np
from typing import Optional, Dict, Any


class ImagePreprocessor:
    """
    Preprocessing pipeline for electricity meter images.
    Improves digit clarity, reduces noise, and increases detection accuracy.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}

    def preprocess(self, image: np.ndarray, options: Optional[Dict[str, Any]] = None) -> np.ndarray:
        """
        Full preprocessing pipeline.

        Args:
            image: Input BGR image (OpenCV format)
            options: Override config options

        Returns:
            Preprocessed image ready for YOLO inference
        """
        opts = {**self.config, **(options or {})}
        img = image.copy()

        # 1. Resize to standard width while maintaining aspect ratio
        resize_width = opts.get("resize_width", 640)
        if resize_width and img.shape[1] != resize_width:
            img = self._resize(img, resize_width)

        # 2. Denoise
        if opts.get("denoise", True):
            strength = opts.get("denoise_strength", 10)
            img = self._denoise(img, strength)

        # 3. Contrast & Brightness adjustment
        alpha = opts.get("contrast_alpha", 1.0)
        beta = opts.get("brightness_beta", 0)
        if alpha != 1.0 or beta != 0:
            img = self._adjust_contrast_brightness(img, alpha, beta)

        # 4. Sharpen
        if opts.get("sharpen", False):
            img = self._sharpen(img)

        # 5. Perspective correction (auto-detect meter face)
        if opts.get("perspective_correction", False):
            corrected = self._perspective_correction(img)
            if corrected is not None:
                img = corrected

        return img

    def preprocess_for_grayscale_analysis(self, image: np.ndarray) -> np.ndarray:
        """
        Produce a grayscale + thresholded version for contour analysis.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)

        # Gaussian blur
        gray = cv2.GaussianBlur(gray, (3, 3), 0)

        # Adaptive threshold
        binary = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11, 2
        )
        return binary

    def _resize(self, img: np.ndarray, target_width: int) -> np.ndarray:
        """Resize maintaining aspect ratio."""
        h, w = img.shape[:2]
        ratio = target_width / w
        new_h = int(h * ratio)
        return cv2.resize(img, (target_width, new_h), interpolation=cv2.INTER_CUBIC)

    def _denoise(self, img: np.ndarray, strength: int = 10) -> np.ndarray:
        """Apply Non-Local Means denoising."""
        if len(img.shape) == 3:
            return cv2.fastNlMeansDenoisingColored(img, None, strength, strength, 7, 21)
        return cv2.fastNlMeansDenoising(img, None, strength, 7, 21)

    def _adjust_contrast_brightness(self, img: np.ndarray, alpha: float, beta: float) -> np.ndarray:
        """
        Adjust contrast (alpha) and brightness (beta).
        alpha: 1.0 = no change, > 1.0 = more contrast
        beta: 0 = no change, positive = brighter
        """
        return cv2.convertScaleAbs(img, alpha=alpha, beta=beta)

    def _sharpen(self, img: np.ndarray) -> np.ndarray:
        """Apply unsharp masking for sharpening."""
        gaussian = cv2.GaussianBlur(img, (0, 0), 3)
        sharpened = cv2.addWeighted(img, 1.5, gaussian, -0.5, 0)
        return sharpened

    def _perspective_correction(self, img: np.ndarray) -> Optional[np.ndarray]:
        """
        Attempt to detect the meter display region and correct perspective distortion.
        Returns corrected image or None if correction fails.
        """
        try:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edges = cv2.Canny(blurred, 50, 150)

            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            if not contours:
                return None

            # Find largest rectangular contour
            contours = sorted(contours, key=cv2.contourArea, reverse=True)

            for contour in contours[:5]:
                peri = cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, 0.02 * peri, True)

                if len(approx) == 4:
                    pts = approx.reshape(4, 2).astype(np.float32)

                    # Order points: top-left, top-right, bottom-right, bottom-left
                    rect = self._order_points(pts)

                    # Compute dimensions
                    width = max(
                        np.linalg.norm(rect[0] - rect[1]),
                        np.linalg.norm(rect[2] - rect[3])
                    )
                    height = max(
                        np.linalg.norm(rect[0] - rect[3]),
                        np.linalg.norm(rect[1] - rect[2])
                    )

                    dst = np.array([
                        [0, 0],
                        [width - 1, 0],
                        [width - 1, height - 1],
                        [0, height - 1]
                    ], dtype=np.float32)

                    M = cv2.getPerspectiveTransform(rect, dst)
                    warped = cv2.warpPerspective(img, M, (int(width), int(height)))
                    return warped

            return None
        except Exception:
            return None

    def _order_points(self, pts: np.ndarray) -> np.ndarray:
        """Order 4 points as: top-left, top-right, bottom-right, bottom-left."""
        rect = np.zeros((4, 2), dtype=np.float32)

        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]  # top-left
        rect[2] = pts[np.argmax(s)]  # bottom-right

        d = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(d)]  # top-right
        rect[3] = pts[np.argmax(d)]  # bottom-left

        return rect
