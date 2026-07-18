/**
 * useOcr - Custom React hook for OCR functionality
 * Manages OCR state, detection, and capture logic
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import OcrService from '../services/OcrService';
import DetectionService from '../services/DetectionService';
import OcrDataLogger from '../services/OcrDataLogger';
import { OcrResultDTO, CameraCaptureDTO } from '../dto/OcrResultDTO';

export const useOcr = () => {
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [captures, setCapturesCa] = useState({ front: null, back: null });
  const [currentSide, setCurrentSide] = useState(null);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const stopDetectionRef = useRef(null);

  /**
   * Initialize OCR and Detection services
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize services
      await OcrService.initialize();
      await DetectionService.initialize();
      await OcrDataLogger.initialize();

      setIsInitialized(true);
      console.log('[useOcr] Initialized successfully');
    } catch (err) {
      setError(err.message);
      console.error('[useOcr] Initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start camera stream
   */
  const startCamera = useCallback(async () => {
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();

      console.log('[useOcr] Camera started');
    } catch (err) {
      setError('Unable to access camera: ' + err.message);
      console.error('[useOcr] Camera error:', err);
    }
  }, []);

  /**
   * Stop camera stream
   */
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;

      if (stopDetectionRef.current) {
        stopDetectionRef.current();
        stopDetectionRef.current = null;
      }

      console.log('[useOcr] Camera stopped');
    }
  }, []);

  /**
   * Start real-time detection
   */
  const startDetection = useCallback(() => {
    if (!videoRef.current || !isInitialized) return;

    try {
      stopDetectionRef.current = DetectionService.startRealTimeDetection(
        videoRef.current,
        (result) => {
          setDetectionResult(result);

          // Draw detections on canvas if available
          if (canvasRef.current) {
            DetectionService.drawDetections(
              canvasRef.current,
              result.allDetections,
              result.documentDetections
            );
          }
        },
        0.3 // confidence threshold
      );

      console.log('[useOcr] Detection started');
    } catch (err) {
      setError('Detection error: ' + err.message);
      console.error('[useOcr] Detection error:', err);
    }
  }, [isInitialized]);

  /**
   * Stop real-time detection
   */
  const stopDetection = useCallback(() => {
    if (stopDetectionRef.current) {
      stopDetectionRef.current();
      stopDetectionRef.current = null;
      setDetectionResult(null);
      console.log('[useOcr] Detection stopped');
    }
  }, []);

  /**
   * Capture image from camera
   */
  const captureImage = useCallback(() => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    const imageBlob = canvas.toDataURL('image/jpeg', 0.8);

    const capture = new CameraCaptureDTO({
      image: imageBlob,
      side: currentSide,
      width: canvas.width,
      height: canvas.height,
      confidence: detectionResult?.documentDetections?.[0]?.confidence || 0,
    });

    setCapturesCa((prev) => ({
      ...prev,
      [currentSide]: capture,
    }));

    console.log('[useOcr] Image captured:', currentSide);
    return capture;
  }, [currentSide, detectionResult]);

  /**
   * Perform OCR on captured image
   */
  const performOcr = useCallback(
    async (side = currentSide) => {
      try {
        if (!captures[side]) {
          setError(`No image captured for ${side} side`);
          return null;
        }

        setIsLoading(true);
        setError(null);

        const startTime = Date.now();
        const image = captures[side].image;

        let result;

        if (side === 'front') {
          const frontData = await OcrService.extractCCCDFront(image);
          result = new OcrResultDTO({
            front: frontData,
            confidence: 0.85, // Estimated
            processingTime: Date.now() - startTime,
            imageQuality: assessImageQuality(captures[side]),
          });
        } else {
          const backData = await OcrService.extractCCCDBack(image);
          result = new OcrResultDTO({
            back: backData,
            confidence: 0.85,
            processingTime: Date.now() - startTime,
            imageQuality: assessImageQuality(captures[side]),
          });
        }

        setOcrResult(result);
        console.log('[useOcr] OCR completed:', result);
        return result;
      } catch (err) {
        setError('OCR failed: ' + err.message);
        console.error('[useOcr] OCR error:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [captures, currentSide]
  );

  /**
   * Log OCR data for training
   */
  const logOcrData = useCallback(
    async (predicted, corrected, userConfirmed = true) => {
      try {
        await OcrDataLogger.logOcrPrediction({
          front: captures.front?.image,
          back: captures.back?.image,
          predictedFront: predicted?.front,
          predictedBack: predicted?.back,
          correctedFront: corrected?.front,
          correctedBack: corrected?.back,
          userConfirmed,
        });

        console.log('[useOcr] Logged OCR data');
      } catch (err) {
        console.error('[useOcr] Logging error:', err);
      }
    },
    [captures]
  );

  /**
   * Reset captures and results
   */
  const reset = useCallback(() => {
    setCapturesCa({ front: null, back: null });
    setOcrResult(null);
    setDetectionResult(null);
    setCurrentSide(null);
    setError(null);
    console.log('[useOcr] Reset');
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCamera();
      stopDetection();
    };
  }, [stopCamera, stopDetection]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    ocrResult,
    detectionResult,
    captures,
    currentSide,
    videoRef,
    canvasRef,

    // Actions
    initialize,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection,
    captureImage,
    performOcr,
    logOcrData,
    setCurrentSide,
    reset,

    // Utilities
    hasDocumentDetected: detectionResult?.hasDocument || false,
    isCaptureReady: captures[currentSide] !== null,
  };
};

/**
 * Assess image quality based on capture data
 */
function assessImageQuality(capture) {
  if (!capture) return 'poor';

  const { confidence, width, height } = capture;

  // High confidence and good resolution
  if (confidence > 0.5 && width > 640 && height > 480) {
    return 'good';
  }

  // Medium confidence or resolution
  if (confidence > 0.3 && width > 320 && height > 240) {
    return 'fair';
  }

  return 'poor';
}
