import { useState, useRef } from 'react';
import { Button, TextField, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { Camera, Upload, Check, X } from 'lucide-react';
import Tesseract from 'tesseract.js';

export function MeterReadingForm({ roomNumber, meterType, previousReading, onConfirm, onCancel }) {
  const [reading, setReading] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);

  const processImage = async (file) => {
    setIsProcessing(true);
    setOcrResult('');

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      const numbers = text.match(/\d+/g);

      if (numbers && numbers.length > 0) {
        const longestNumber = numbers.reduce((a, b) => a.length > b.length ? a : b);
        setOcrResult(longestNumber);
        setReading(longestNumber);
      } else {
        setOcrResult('Không tìm thấy số trong ảnh');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      setOcrResult('Lỗi khi quét ảnh. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    const numReading = parseFloat(reading);
    if (!isNaN(numReading) && numReading >= previousReading) {
      onConfirm(numReading);
    }
  };

  const getMeterLabel = () => {
    return meterType === 'electric' ? 'Điện' : 'Nước';
  };

  const gradientColor = meterType === 'electric'
    ? 'from-yellow-400 to-orange-500'
    : 'from-blue-400 to-cyan-500';
  const icon = meterType === 'electric' ? '⚡' : '💧';

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
          <div className="mb-6 p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">Chỉ số cũ</p>
            <p className="text-3xl font-bold text-blue-600">
              {previousReading} {meterType === 'electric' ? 'kWh' : 'm³'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="contained"
                startIcon={<Camera />}
                onClick={handleCameraCapture}
                fullWidth
                disabled={isProcessing}
                sx={{
                  borderRadius: '12px',
                  py: 1.5,
                  background: `linear-gradient(135deg, ${meterType === 'electric' ? '#f59e0b' : '#3b82f6'} 0%, ${meterType === 'electric' ? '#ef4444' : '#06b6d4'} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${meterType === 'electric' ? '#d97706' : '#2563eb'} 0%, ${meterType === 'electric' ? '#dc2626' : '#0891b2'} 100%)`,
                  },
                }}
              >
                Chụp ảnh
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                disabled={isProcessing}
                sx={{ borderRadius: '12px', py: 1.5 }}
              >
                Tải ảnh
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isProcessing && (
              <div className="flex flex-col items-center gap-3 py-8">
                <CircularProgress size={48} />
                <p className="text-gray-600">Đang quét chỉ số...</p>
              </div>
            )}

            {ocrResult && !isProcessing && (
              <Alert
                severity={reading ? 'success' : 'warning'}
                sx={{ borderRadius: '12px' }}
              >
                {reading ? `✓ Đã quét được: ${ocrResult}` : ocrResult}
              </Alert>
            )}

            <TextField
              label={`Chỉ số ${getMeterLabel()} mới`}
              type="number"
              fullWidth
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              helperText="Nhập số mới hoặc chụp ảnh để quét tự động"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
              InputProps={{
                style: { fontSize: '1.5rem', fontWeight: 'bold' },
              }}
            />

            {reading && parseFloat(reading) < previousReading && (
              <Alert severity="error" sx={{ borderRadius: '12px' }}>
                ⚠️ Chỉ số mới không được nhỏ hơn chỉ số cũ!
              </Alert>
            )}

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
                disabled={!reading || parseFloat(reading) < previousReading}
                sx={{ borderRadius: '12px', py: 1.5 }}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
