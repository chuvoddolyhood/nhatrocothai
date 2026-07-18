/**
 * CameraDialog - Camera interface for CCCD capture
 * Real-time detection and image capture
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import { Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { useOcr } from '../hooks/useOcr';

export default function CameraDialog({
  open,
  onClose,
  onCaptureComplete,
  initialSide = 'front',
  ocr
}) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [detectionQuality, setDetectionQuality] = useState('poor');

  // Initialize on mount
  useEffect(() => {
    if (open && !ocr.isInitialized) {
      ocr.initialize();
    }
  }, [open]);

  // Start camera and detection when dialog opens
  useEffect(() => {
    if (open && ocr.isInitialized) {
      ocr.setCurrentSide(initialSide);
      
      const tryStartCamera = () => {
        if (ocr.videoRef.current) {
          ocr.startCamera();
          setTimeout(() => ocr.startDetection(), 500); // Delay for camera to start
        } else {
          setTimeout(tryStartCamera, 50);
        }
      };
      tryStartCamera();
    }

    return () => {
      if (open) {
        ocr.stopCamera();
        ocr.stopDetection();
      }
    };
  }, [open, ocr.isInitialized]);

  // Update detection quality indicator
  useEffect(() => {
    if (ocr.detectionResult?.documentDetections?.length > 0) {
      const confidence = ocr.detectionResult.documentDetections[0].confidence;
      if (confidence > 0.6) {
        setDetectionQuality('excellent');
      } else if (confidence > 0.4) {
        setDetectionQuality('good');
      } else {
        setDetectionQuality('fair');
      }
    } else {
      setDetectionQuality('poor');
    }
  }, [ocr.detectionResult]);

  const handleCapture = () => {
    const capture = ocr.captureImage();
    if (capture) {
      // Switch to other side or close
      if (ocr.currentSide === 'front') {
        ocr.setCurrentSide('back');
        setDetectionQuality('poor'); // Reset quality for the back side
      } else {
        onCaptureComplete({
          ...ocr.captures,
          [ocr.currentSide]: capture
        });
        ocr.stopCamera();
        ocr.stopDetection();
        onClose();
      }
    }
  };

  const handleRetake = () => {
    // Reset detection and wait for new capture
    setDetectionQuality('poor');
  };

  const handleClose = () => {
    ocr.stopCamera();
    ocr.stopDetection();
    ocr.reset();
    onClose();
  };

  const getQualityColor = () => {
    switch (detectionQuality) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'warning';
      case 'fair':
        return 'info';
      default:
        return 'error';
    }
  };

  const getQualityText = () => {
    const quality = {
      excellent: 'Xuất sắc',
      good: 'Tốt',
      fair: 'Trung bình',
      poor: 'Xoàn',
    };
    return quality[detectionQuality] || 'Xoàn';
  };

  if (ocr.error) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Lỗi Camera</DialogTitle>
        <DialogContent>
          <Alert severity="error">
            <AlertCircle size={16} style={{ marginRight: '8px' }} />
            {ocr.error}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Chụp ảnh CCCD - {ocr.currentSide === 'front' ? 'Mặt trước' : 'Mặt sau'}</span>
          {ocr.isLoading && <CircularProgress size={20} />}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Camera Container */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              paddingBottom: '100%', // 1:1 aspect ratio
              backgroundColor: '#000',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            {/* Video Element */}
            <video
              ref={ocr.videoRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Detection Canvas */}
            <canvas
              ref={ocr.canvasRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            />

            {/* Overlay Guide */}
            {showOverlay && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)',
                }}
              />
            )}

            {/* Quality Indicator */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {detectionQuality === 'excellent' ? (
                <CheckCircle size={20} color="#4caf50" />
              ) : (
                <AlertCircle size={20} color="#ff9800" />
              )}
              <Chip
                label={getQualityText()}
                size="small"
                color={getQualityColor()}
                variant="outlined"
              />
            </Box>

            {/* Instructions */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 24,
                left: 0,
                right: 0,
                textAlign: 'center',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                px: 2
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8), 0px 0px 8px rgba(0,0,0,0.6)' }}
              >
                {ocr.currentSide === 'front' ? 'HƯỚNG MẶT TRƯỚC CCCD VÀO KHUNG' : 'HƯỚNG MẶT SAU CCCD VÀO KHUNG'}
              </Typography>
            </Box>
          </Box>

          {/* Status Messages */}
          {!ocr.isInitialized && (
            <Alert severity="info">
              <CircularProgress size={16} style={{ marginRight: '8px' }} />
              Đang khởi tạo camera...
            </Alert>
          )}

          {ocr.hasDocumentDetected && detectionQuality !== 'poor' && (
            <Alert severity="success">
              <CheckCircle size={16} style={{ marginRight: '8px' }} />
              Đã phát hiện thẻ CCCD - Nhấn "Chụp ảnh" để tiếp tục
            </Alert>
          )}

          {!ocr.hasDocumentDetected && ocr.isInitialized && (
            <Alert severity="warning">
              <AlertCircle size={16} style={{ marginRight: '8px' }} />
              Chưa phát hiện thẻ CCCD - Đưa thẻ vào khung hình
            </Alert>
          )}

          {/* Info */}
          <Typography variant="caption" color="textSecondary">
            Chất lượng ảnh: {getQualityText()} ({detectionQuality})
            <br />
            Phát hiện: {ocr.detectionResult?.documentDetections?.length || 0} đối tượng
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setShowOverlay(!showOverlay)} size="small">
          {showOverlay ? 'Ẩn' : 'Hiện'} khung hình
        </Button>
        <Button onClick={handleRetake}>Lại</Button>
        <Button
          onClick={handleClose}
          disabled={ocr.isLoading || !ocr.isInitialized}
        >
          Hủy
        </Button>
        <Button
          onClick={handleCapture}
          variant="contained"
          disabled={
            ocr.isLoading || 
            !ocr.isInitialized ||
            (ocr.hasDocumentDetected && detectionQuality === 'poor')
          }
          startIcon={<Camera size={16} />}
        >
          {ocr.isLoading ? 'Đang xử lý...' : 'Chụp ảnh'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
