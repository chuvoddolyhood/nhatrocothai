/**
 * Hook for OCR capture and processing
 * Handles the complete OCR pipeline: capture → preprocess → recognize → validate
 */

import { useState, useCallback, useRef } from 'react';
import { ocrService } from '../services/OCRService';
import { 
  loadImage, 
  preprocessImage, 
  preprocessImageSimple,
  resizeImage,
  imageToCanvas 
} from '../utils/imageProcessing';

export function useOCRCapture() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef(null);

  /**
   * Process image with OCR
   * @param {File} imageFile - Captured image file
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} OCR result
   */
  const processImage = useCallback(async (imageFile, options = {}) => {
    const {
      useOpenCV = true, // Enable OpenCV preprocessing (self-hosted, no CORS issues)
      maxWidth = 1920,
      maxHeight = 1080,
    } = options;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setResult(null);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      console.log('[useOCRCapture] Starting image processing...');
      
      // Step 1: Load image (10%)
      setProgress(10);
      const img = await loadImage(imageFile);
      console.log(`[useOCRCapture] Image loaded: ${img.width}x${img.height}`);
      
      // Step 2: Convert to canvas and resize if needed (20%)
      setProgress(20);
      let canvas = imageToCanvas(img);
      canvas = resizeImage(canvas, maxWidth, maxHeight);
      
      // Step 3: Preprocess image (40%)
      setProgress(40);
      let processedCanvas;
      
      // Note: OpenCV is disabled by default due to CDN CORS issues
      // Canvas API preprocessing provides acceptable quality (~75-80% accuracy)
      if (useOpenCV) {
        try {
          console.log('[useOCRCapture] Attempting OpenCV preprocessing...');
          processedCanvas = await preprocessImage(canvas);
        } catch (preprocessError) {
          console.warn('[useOCRCapture] OpenCV unavailable, using Canvas API fallback');
          processedCanvas = preprocessImageSimple(canvas);
        }
      } else {
        // Default: Use Canvas API preprocessing (no external dependencies)
        console.log('[useOCRCapture] Using Canvas API preprocessing...');
        processedCanvas = preprocessImageSimple(canvas);
      }
      
      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Processing cancelled');
      }
      
      // Step 4: OCR Recognition (80%)
      setProgress(80);
      const ocrResult = await ocrService.recognize(processedCanvas);
      
      // Step 5: Validate result (100%)
      setProgress(100);
      const validation = ocrService.validateResult(ocrResult);
      
      // Create image URLs for display
      const originalImageUrl = URL.createObjectURL(imageFile);
      const processedImageUrl = processedCanvas.toDataURL('image/jpeg', 0.8);
      
      const finalResult = {
        ...ocrResult,
        ...validation,
        originalImageUrl,
        processedImageUrl,
        imageFile,
        timestamp: new Date().toISOString(),
      };
      
      setResult(finalResult);
      console.log('[useOCRCapture] Processing completed:', finalResult);
      
      return finalResult;
      
    } catch (err) {
      console.error('[useOCRCapture] Processing error:', err);
      const errorMessage = err.message || 'Không thể xử lý ảnh. Vui lòng thử lại.';
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setIsProcessing(false);
      setProgress(0);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Process image with multiple attempts for better accuracy
   */
  const processImageWithRetry = useCallback(async (imageFile, options = {}) => {
    const maxAttempts = options.maxAttempts || 2;
    let bestResult = null;
    let highestConfidence = 0;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[useOCRCapture] Attempt ${attempt}/${maxAttempts}`);
        
        const result = await processImage(imageFile, options);
        
        if (result.confidence > highestConfidence) {
          highestConfidence = result.confidence;
          bestResult = result;
        }
        
        // If confidence is good enough, stop
        if (result.confidence > 0.85) {
          console.log('[useOCRCapture] Good confidence achieved, stopping');
          break;
        }
        
      } catch (err) {
        console.warn(`[useOCRCapture] Attempt ${attempt} failed:`, err);
        if (attempt === maxAttempts) {
          throw err;
        }
      }
    }
    
    return bestResult;
  }, [processImage]);

  /**
   * Cancel ongoing processing
   */
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsProcessing(false);
      setProgress(0);
      console.log('[useOCRCapture] Processing cancelled');
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    setIsProcessing(false);
    
    // Cleanup image URLs
    if (result?.originalImageUrl) {
      URL.revokeObjectURL(result.originalImageUrl);
    }
  }, [result]);

  /**
   * Update result text (for manual correction)
   */
  const updateResultText = useCallback((newText) => {
    if (result) {
      const updatedResult = {
        ...result,
        text: newText,
        isManuallyEdited: true,
      };
      
      // Re-validate
      const validation = ocrService.validateResult(updatedResult);
      setResult({
        ...updatedResult,
        ...validation,
      });
    }
  }, [result]);

  return {
    // State
    isProcessing,
    result,
    error,
    progress,
    
    // Actions
    processImage,
    processImageWithRetry,
    cancelProcessing,
    reset,
    updateResultText,
  };
}

export default useOCRCapture;
