/**
 * Image Preprocessing Utilities for OCR
 * Uses OpenCV.js for image enhancement
 */

// Self-hosted OpenCV.js (no CDN dependency, no CORS issues)
const OPENCV_URL = "/opencv.js"; // Served from /public folder
const OPENCV_LOAD_TIMEOUT = 20000; // 20 seconds (large file ~13MB)
const OPENCV_CHECK_INTERVAL = 100;

/**
 * Load OpenCV.js from CDN
 * @returns {Promise<void>}
 */
export async function loadOpenCV() {
  // Check if OpenCV is already loaded
  if (window.cv?.Mat) {
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = OPENCV_URL;
    script.async = true;
    script.crossOrigin = "anonymous"; // Enable CORS

    script.onload = () => {
      // Wait for OpenCV to be ready
      const checkOpenCV = setInterval(() => {
        if (window.cv?.Mat) {
          clearInterval(checkOpenCV);

          console.log("[OpenCV] Loaded successfully from self-hosted file");
          resolve();
        }
      }, OPENCV_CHECK_INTERVAL);

      // Timeout after 20 seconds
      setTimeout(() => {
        clearInterval(checkOpenCV);
        reject(new Error("OpenCV loading timeout"));
      }, OPENCV_LOAD_TIMEOUT);
    };

    script.onerror = () => {
      reject(new Error("Failed to load OpenCV.js from CDN"));
    };

    document.head.appendChild(script);
  });
}

/**
 * Load image from file or URL
 * @param {File|string} source - Image file or URL
 * @returns {Promise<HTMLImageElement>}
 */
export async function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Convert image to canvas
 * @param {HTMLImageElement} img - Image element
 * @returns {HTMLCanvasElement}
 */
export function imageToCanvas(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  return canvas;
}

/**
 * Preprocess image for OCR using OpenCV.js
 * @param {HTMLImageElement|HTMLCanvasElement} image - Input image
 * @returns {Promise<HTMLCanvasElement>} - Processed image
 */
export async function preprocessImage(image) {
  await loadOpenCV();

  const cv = window.cv;
  let src = null;
  let processed = null;

  try {
    // Convert image to canvas if needed
    const canvas =
      image instanceof HTMLCanvasElement ? image : imageToCanvas(image);

    // Read image into OpenCV Mat
    src = cv.imread(canvas);

    // Step 1: Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Step 2: Increase contrast using histogram equalization
    const enhanced = new cv.Mat();
    cv.equalizeHist(gray, enhanced);

    // Step 3: Denoise
    const denoised = new cv.Mat();
    cv.fastNlMeansDenoising(enhanced, denoised, 10, 7, 21);

    // Step 4: Adaptive thresholding for better digit separation
    const binary = new cv.Mat();
    cv.adaptiveThreshold(
      denoised,
      binary,
      255,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C,
      cv.THRESH_BINARY,
      11,
      2,
    );

    // Step 5: Slight dilation to connect broken parts of digits
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
    processed = new cv.Mat();
    cv.dilate(binary, processed, kernel);

    // Convert back to canvas
    const outputCanvas = document.createElement("canvas");
    cv.imshow(outputCanvas, processed);

    // Cleanup
    gray.delete();
    enhanced.delete();
    denoised.delete();
    binary.delete();
    kernel.delete();
    processed.delete();
    src.delete();

    console.log("[ImageProcessing] Preprocessing completed");
    return outputCanvas;
  } catch (error) {
    console.error("[ImageProcessing] Error:", error);

    // Cleanup on error
    if (src) src.delete();
    if (processed) processed.delete();

    // Fallback: return original image as canvas

    console.warn("[ImageProcessing] Falling back to original image");
    return image instanceof HTMLCanvasElement ? image : imageToCanvas(image);
  }
}

/**
 * Simple preprocessing without OpenCV (fallback)
 * Uses canvas API for basic enhancements
 * @param {HTMLImageElement|HTMLCanvasElement} image - Input image
 * @returns {HTMLCanvasElement}
 */
export function preprocessImageSimple(image) {
  const canvas =
    image instanceof HTMLCanvasElement ? image : imageToCanvas(image);

  // Ensure minimum dimensions to avoid Tesseract errors
  if (canvas.width < 100 || canvas.height < 100) {
    console.warn(`[ImageProcessing] Image too small (${canvas.width}x${canvas.height}), skipping preprocessing`);
    return canvas;
  }

  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    // Grayscale using luminosity method
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    // Increase contrast
    const contrast = 1.5;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const enhanced = factor * (gray - 128) + 128;

    // Clamp values
    const final = Math.max(0, Math.min(255, enhanced));

    data[i] = final;
    data[i + 1] = final;
    data[i + 2] = final;
  }

  ctx.putImageData(imageData, 0, 0);

  console.log(`[ImageProcessing] Simple preprocessing completed: ${canvas.width}x${canvas.height}`);

  return canvas;
}

/**
 * Crop image to region of interest
 * @param {HTMLCanvasElement} canvas - Input canvas
 * @param {Object} rect - {x, y, width, height}
 * @returns {HTMLCanvasElement}
 */
export function cropImage(canvas, rect) {
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = rect.width;
  croppedCanvas.height = rect.height;

  const ctx = croppedCanvas.getContext("2d");
  ctx.drawImage(
    canvas,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height,
  );

  return croppedCanvas;
}

/**
 * Resize image maintaining aspect ratio
 * @param {HTMLCanvasElement} canvas - Input canvas
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {HTMLCanvasElement}
 */
export function resizeImage(canvas, maxWidth = 1920, maxHeight = 1080) {
  const { width, height } = canvas;

  // Calculate new dimensions
  let newWidth = width;
  let newHeight = height;

  if (width > maxWidth) {
    newWidth = maxWidth;
    newHeight = (height * maxWidth) / width;
  }

  if (newHeight > maxHeight) {
    newHeight = maxHeight;
    newWidth = (width * maxHeight) / height;
  }

  // No resize needed
  if (newWidth === width && newHeight === height) {
    return canvas;
  }

  const resizedCanvas = document.createElement("canvas");
  resizedCanvas.width = newWidth;
  resizedCanvas.height = newHeight;

  const ctx = resizedCanvas.getContext("2d");
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

  console.log(
    `[ImageProcessing] Resized from ${width}x${height} to ${newWidth}x${newHeight}`,
  );
  return resizedCanvas;
}

/**
 * Convert canvas to blob
 * @param {HTMLCanvasElement} canvas - Input canvas
 * @param {string} mimeType - Output MIME type
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, mimeType = "image/jpeg", quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      },
      mimeType,
      quality,
    );
  });
}

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>}
 */
export async function getImageDimensions(file) {
  const img = await loadImage(file);
  return {
    width: img.width,
    height: img.height,
  };
}
