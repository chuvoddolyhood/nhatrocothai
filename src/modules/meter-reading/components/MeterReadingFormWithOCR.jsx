/**
 * Enhanced MeterReadingForm with OCR Integration
 * Uses the new OCR module with improved image processing and validation
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, Card, CardContent, Alert } from '@mui/material';
import { Camera, Edit, Check, X } from 'lucide-react';
import { OCRMeterReading } from '../../ocr';
import { uploadMeterImage, compressImage } from '../../ocr/services/ImageStorageService';

export function MeterReadingFormWithOCR({ 
  roomId,
  contractId,
  roomNumber, 
  meterType, 
  previousReading, 
  month, // 'YYYY-MM' format
  userId,
  onConfirm, 
  onCancel 
}) {
  const [mode, setMode] = useState('input'); // 'input' | 'ocr'
  const [reading, setReading] = useState('');
  const [ocrData, setOcrData] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const getMeterLabel = () => {
    return meterType === 'electric' ? 'Điện' : 'Nước';
  };

  const gradientColor = meterType === 'electric'
    ? 'from-yellow-400 to-orange-500'
    : 'from-blue-400 to-cyan-500';
  const icon = meterType === 'electric' ? '⚡' : '💧';

  /**
   * Handle OCR completion
   */
  const handleOCRComplete = async (data) => {
    console.log('[MeterReadingForm] OCR completed:', data);
    
    try {
      setIsUploading(true);
      setError(null);

      // Compress image before upload
      const compressedFile = await compressImage(data.imageFile, 2, 0.8);
      
      // Upload image to Supabase Storage
      const uploadedUrl = await uploadMeterImage(compressedFile, {
        roomId,
        contractId,
        month,
        type: meterType,
        userId,
      });

      console.log('[MeterReadingForm] Image uploaded:', uploadedUrl);

      // Set OCR data and reading
      setOcrData({
        text: data.text,
        confidence: data.confidence,
        isEdited: data.isEdited,
        originalText: data.originalText,
      });
      setImageUrl(uploadedUrl);
      setReading(data.text);
      setMode('input');
      
    } catch (err) {
      console.error('[MeterReadingForm] Upload error:', err);
      setError(err.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
      
      // Still allow user to proceed with manual input
      setReading(data.text);
      setMode('input');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle OCR cancel
   */
  const handleOCRCancel = () => {
    setMode('input');
  };

  /**
   * Handle form confirmation
   */
  const handleConfirm = () => {
    const numReading = Number.parseFloat(reading);
    
    if (!Number.isNaN(numReading) && numReading >= previousReading) {
      onConfirm({
        reading: numReading,
        meterType,
        imageUrl,
        ocrData: ocrData ? {
          text: ocrData.text,
          confidence: ocrData.confidence,
          isEdited: ocrData.isEdited,
          verified: true,
        } : null,
      });
    }
  };

  /**
   * Start OCR capture mode
   */
  const handleStartOCR = () => {
    setMode('ocr');
    setError(null);
  };

  /**
   * Clear reading and start over
   */
  const handleClearReading = () => {
    setReading('');
    setOcrData(null);
    setImageUrl(null);
    setError(null);
  };

  // OCR Mode
  if (mode === 'ocr') {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50">
        <OCRMeterReading
          meterType={meterType}
          onComplete={handleOCRComplete}
          onCancel={handleOCRCancel}
        />
      </div>
    );
  }

  // Input Mode
  return (
    <div>
      <div className={`bg-gradient-to-r ${gradientColor} p-6 text-white rounded-t-2xl`}>
        <div className="text-center">
          <div className="text-5xl mb-3">{icon}</div>
          <h3 className="text-2xl mb-1">
            Ghi chỉ số {getMeterLabel()}
          </h3>
          <p className="opacity-90">Phòng {roomNumber}</p>
        </div>
      </div>

      <Card sx={{ borderRadius: '0 0 16px 16px', boxShadow: 'none' }}>
        <CardContent className="p-6">
          {/* Previous Reading Display */}
          <div className="mb-6 p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Chỉ số cũ</p>
            <p className="text-3xl font-bold text-blue-600">
              {previousReading} {meterType === 'electric' ? 'kWh' : 'm³'}
            </p>
          </div>

          <div className="space-y-4">
            {/* OCR Success Message */}
            {ocrData && (
              <Alert 
                severity="success" 
                sx={{ borderRadius: '12px' }}
                onClose={handleClearReading}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <strong>✓ Đã quét thành công</strong>
                    <p className="text-sm mt-1">
                      Độ chính xác: {Math.round(ocrData.confidence * 100)}%
                      {ocrData.isEdited && ' (đã chỉnh sửa)'}
                    </p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Upload Error */}
            {error && (
              <Alert 
                severity="warning" 
                sx={{ borderRadius: '12px' }}
              >
                {error}
                <p className="text-sm mt-1">
                  Bạn vẫn có thể tiếp tục nhập số thủ công.
                </p>
              </Alert>
            )}

            {/* OCR Capture Button */}
            {!reading && (
              <Button
                variant="contained"
                startIcon={<Camera />}
                onClick={handleStartOCR}
                fullWidth
                size="large"
                sx={{
                  borderRadius: '12px',
                  py: 2,
                  background: `linear-gradient(135deg, ${meterType === 'electric' ? '#f59e0b' : '#3b82f6'} 0%, ${meterType === 'electric' ? '#ef4444' : '#06b6d4'} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${meterType === 'electric' ? '#d97706' : '#2563eb'} 0%, ${meterType === 'electric' ? '#dc2626' : '#0891b2'} 100%)`,
                  },
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                📷 Chụp ảnh đồng hồ
              </Button>
            )}

            {/* Divider */}
            {!reading && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 border-t border-gray-300" />
                <span className="text-sm text-gray-500">hoặc</span>
                <div className="flex-1 border-t border-gray-300" />
              </div>
            )}

            {/* Manual Input */}
            <TextField
              label={`Chỉ số ${getMeterLabel()} mới`}
              type="number"
              fullWidth
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              helperText={reading ? "Bạn có thể chỉnh sửa số đã quét" : "Nhập thủ công hoặc chụp ảnh để quét tự động"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
              InputProps={{
                style: { fontSize: '1.5rem', fontWeight: 'bold' },
                endAdornment: reading && (
                  <Edit size={20} className="text-gray-400" />
                ),
              }}
            />

            {/* Validation Warning */}
            {reading && Number.parseFloat(reading) < previousReading && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                ⚠️ Chỉ số mới không được nhỏ hơn chỉ số cũ ({previousReading})
              </Alert>
            )}

            {/* Usage Display */}
            {reading && Number.parseFloat(reading) >= previousReading && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Lượng tiêu thụ:</span>
                  <span className="text-xl font-bold text-green-700">
                    {Number.parseFloat(reading) - previousReading} {meterType === 'electric' ? 'kWh' : 'm³'}
                  </span>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Ảnh đã chụp:</p>
                <img 
                  src={imageUrl} 
                  alt="Meter reading" 
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outlined"
                startIcon={<X />}
                onClick={onCancel}
                fullWidth
                sx={{ borderRadius: '12px', py: 1.5 }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                startIcon={<Check />}
                onClick={handleConfirm}
                fullWidth
                disabled={!reading || Number.parseFloat(reading) < previousReading || isUploading}
                sx={{ 
                  borderRadius: '12px', 
                  py: 1.5,
                  position: 'relative',
                }}
              >
                {isUploading ? 'Đang tải ảnh...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

MeterReadingFormWithOCR.propTypes = {
  roomId: PropTypes.string.isRequired,
  contractId: PropTypes.string.isRequired,
  roomNumber: PropTypes.string.isRequired,
  meterType: PropTypes.oneOf(['electric', 'water']).isRequired,
  previousReading: PropTypes.number.isRequired,
  month: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default MeterReadingFormWithOCR;
