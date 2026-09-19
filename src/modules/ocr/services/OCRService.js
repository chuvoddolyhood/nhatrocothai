/**
 * OCR Service - Tesseract.js wrapper for meter reading
 * Optimized for digit recognition from meter displays
 */

import { createWorker } from "tesseract.js";

const DIGIT_WHITELIST = "0123456789";
const SINGLE_LINE_MODE = "7";
const HIGH_CONFIDENCE_THRESHOLD = 0.85;
const MIN_CONFIDENCE_THRESHOLD = 0.5;
const MIN_DIGIT_LENGTH = 3;
const MAX_DIGIT_LENGTH = 8;

class OCRService {
  worker = null;
  isInitialized = false;

  /**
   * Initialize Tesseract worker with optimized settings for digit recognition
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      console.log("[OCR] Initializing Tesseract worker...");

      this.worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      // Optimize for digit recognition
      await this.worker.setParameters({
        tessedit_char_whitelist: DIGIT_WHITELIST,
        tessedit_pageseg_mode: SINGLE_LINE_MODE,
      });

      this.isInitialized = true;

      console.log("[OCR] Worker initialized successfully");
    } catch (error) {
      console.error("[OCR] Initialization error:", error);
      throw new Error("Không thể khởi tạo OCR engine. Vui lòng thử lại.");
    }
  }

  /**
   * Recognize digits from image
   * @param {string|HTMLImageElement|HTMLCanvasElement|File} image - Image source
   * @returns {Promise<{text: string, confidence: number, rawText: string, processingTime: number}>}
   */
  async recognize(image) {
    await this.initialize();

    try {
      console.log("[OCR] Starting recognition...");
      const startTime = performance.now();

      const { data } = await this.worker.recognize(image);

      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      console.log(`[OCR] Recognition completed in ${processingTime}ms`);

      // Extract only digits from result
      const cleanedText = data.text.replace(/\D/g, "");

      const result = {
        text: cleanedText,
        confidence: data.confidence / 100, // Normalize to 0-1
        rawText: data.text,
        processingTime,
      };

      console.log("[OCR] Result:", result);
      return result;
    } catch (error) {
      console.error("[OCR] Recognition error:", error);
      throw new Error("Không thể đọc được số từ ảnh. Vui lòng thử chụp lại.");
    }
  }

  /**
   * Recognize with multiple attempts for better accuracy
   * @param {string|HTMLImageElement|HTMLCanvasElement|File} image - Image source
   * @param {number} attempts - Number of recognition attempts
   * @returns {Promise<{text: string, confidence: number, rawText: string, processingTime: number}>}
   */
  async recognizeWithRetry(image, attempts = 2) {
    let bestResult = null;
    let highestConfidence = 0;

    for (let i = 0; i < attempts; i += 1) {
      try {
        const result = await this.recognize(image);

        if (result.confidence > highestConfidence) {
          highestConfidence = result.confidence;
          bestResult = result;
        }

        // If confidence is high enough, no need to retry
        if (result.confidence > HIGH_CONFIDENCE_THRESHOLD) {
          break;
        }
      } catch (error) {
        console.warn(`[OCR] Attempt ${i + 1} failed:`, error);
        if (i === attempts - 1) {
          throw error;
        }
      }
    }

    return bestResult;
  }

  /**
   * Validate OCR result
   * @param {{text: string, confidence: number}} result - OCR result
   * @returns {{isValid: boolean, needsVerification: boolean, errors: string[], warning: string | null}}
   */
  validateResult(result) {
    const errors = [];

    // Check if text is empty
    if (!result.text || result.text.length === 0) {
      errors.push("Không đọc được số từ ảnh");
    }

    // Check length (meter readings are typically 3-8 digits)
    if (result.text.length < MIN_DIGIT_LENGTH) {
      errors.push(`Chỉ số quá ngắn (ít hơn ${MIN_DIGIT_LENGTH} chữ số)`);
    }

    if (result.text.length > MAX_DIGIT_LENGTH) {
      errors.push(`Chỉ số quá dài (nhiều hơn ${MAX_DIGIT_LENGTH} chữ số)`);
    }

    // Check confidence
    const needsVerification = result.confidence < HIGH_CONFIDENCE_THRESHOLD;

    const isValid =
      errors.length === 0 &&
      result.text.length >= MIN_DIGIT_LENGTH &&
      result.text.length <= MAX_DIGIT_LENGTH &&
      result.confidence > MIN_CONFIDENCE_THRESHOLD;

    return {
      isValid,
      needsVerification,
      errors,
      warning: needsVerification
        ? "Độ tin cậy thấp. Vui lòng kiểm tra kỹ số liệu."
        : null,
    };
  }

  /**
   * Terminate worker and cleanup resources
   * @returns {Promise<void>}
   */
  async terminate() {
    if (this.worker) {
      console.log("[OCR] Terminating worker...");
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;

      console.log("[OCR] Worker terminated");
    }
  }
}

// Singleton instance
export const ocrService = new OCRService();

// Export class for testing
export default OCRService;
