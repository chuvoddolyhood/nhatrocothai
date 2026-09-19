/**
 * OCRMeterReading Component
 * Main component that orchestrates the OCR workflow:
 * 1. Camera capture
 * 2. Image preprocessing & OCR
 * 3. Result verification
 * 4. Confirmation
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Camera, Loader2 } from 'lucide-react';
import { CameraCapture, CameraFallback } from './CameraCapture';
import { OCRVerification } from './OCRVerification';
import { useOCRCapture } from '../hooks/useOCRCapture';

export function OCRMeterReading({ 
  meterType = 'electric', // 'electric' or 'water'
  onComplete,
  onCancel,
}) {
  const [step, setStep] = useState('idle'); // 'idle' | 'camera' | 'processing' | 'verification'
  const { 
    result, 
    error, 
    progress,
    processImage, 
    reset 
  } = useOCRCapture();

  const meterLabel = meterType === 'electric' ? 'điện' : 'nước';

  /**
   * Start camera capture
   */
  const handleStartCapture = () => {
    setStep('camera');
  };

  /**
   * Handle image captured from camera
   */
  const handleImageCaptured = async (imageFile) => {
    setStep('processing');
    
    try {
      await processImage(imageFile, {
        useOpenCV: true,
        maxWidth: 1920,
        maxHeight: 1080,
      });
      
      setStep('verification');
    } catch (err) {
      console.error('[OCRMeterReading] Processing error:', err);
      // Stay in processing step to show error
    }
  };

  /**
   * Handle retake photo
   */
  const handleRetake = () => {
    reset();
    setStep('camera');
  };

  /**
   * Handle confirmation
   */
  const handleConfirm = (data) => {
    if (onComplete) {
      onComplete({
        ...data,
        meterType,
      });
    }
    reset();
    setStep('idle');
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    reset();
    setStep('idle');
    if (onCancel) {
      onCancel();
    }
  };

  // Idle state - show start button
  if (step === 'idle') {
    return (
      <div className="text-center p-6">
        <button
          onClick={handleStartCapture}
          type="button"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white 
                   rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          <Camera size={20} />
          Chụp ảnh đồng hồ {meterLabel}
        </button>
        
        <p className="mt-3 text-sm text-gray-600">
          Hoặc nhập số thủ công
        </p>
      </div>
    );
  }

  // Camera capture state
  if (step === 'camera') {
    // Check if camera is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return (
        <CameraCapture
          onCapture={handleImageCaptured}
          onCancel={handleCancel}
        />
      );
    } else {
      return (
        <CameraFallback
          onCapture={handleImageCaptured}
          onCancel={handleCancel}
        />
      );
    }
  }

  // Processing state
  if (step === 'processing') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Loader2 size={32} className="text-blue-600 animate-spin" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            Đang xử lý ảnh...
          </h3>
          
          <p className="text-gray-600 text-sm">
            Có thể mất 5-10 giây
          </p>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {progress}%
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Retry Button */}
        {error && (
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              type="button"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 transition"
            >
              Thử lại
            </button>
            <button
              onClick={handleCancel}
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-lg 
                       hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          </div>
        )}
      </div>
    );
  }

  // Verification state
  if (step === 'verification' && result) {
    return (
      <OCRVerification
        result={result}
        meterType={meterType}
        onConfirm={handleConfirm}
        onRetake={handleRetake}
      />
    );
  }

  return null;
}

OCRMeterReading.propTypes = {
  meterType: PropTypes.oneOf(['electric', 'water']),
  onComplete: PropTypes.func,
  onCancel: PropTypes.func,
};

OCRMeterReading.defaultProps = {
  meterType: 'electric',
  onComplete: null,
  onCancel: null,
};

export default OCRMeterReading;
