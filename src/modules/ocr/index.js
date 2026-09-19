/**
 * OCR Module Exports
 * Main entry point for OCR functionality
 */

// Components
export { OCRMeterReading } from './components/OCRMeterReading';
export { CameraCapture, CameraFallback } from './components/CameraCapture';
export { OCRVerification } from './components/OCRVerification';

// Hooks
export { useOCRCapture } from './hooks/useOCRCapture';

// Services
export { ocrService } from './services/OCRService';
export {
  uploadMeterImage,
  uploadMultipleMeterImages,
  deleteMeterImage,
  getSignedImageUrl,
  checkStorageBucket,
  getFileSize,
  compressImage,
} from './services/ImageStorageService';

// Utils
export {
  loadOpenCV,
  loadImage,
  imageToCanvas,
  preprocessImage,
  preprocessImageSimple,
  cropImage,
  resizeImage,
  canvasToBlob,
  getImageDimensions,
} from './utils/imageProcessing';
