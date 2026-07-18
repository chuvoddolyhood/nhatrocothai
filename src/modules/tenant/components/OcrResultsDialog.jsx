/**
 * OcrResultsDialog - UI for verifying OCR results
 * Displays extracted data, allows user correction
 * Auto-fills form when confirmed
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Check, AlertCircle, Edit } from 'lucide-react';

export default function OcrResultsDialog({
  open,
  onClose,
  ocrResult,
  isLoading,
  onConfirm,
  onCancel,
}) {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [frontData, setFrontData] = useState(ocrResult?.front || {});
  const [backData, setBackData] = useState(ocrResult?.back || {});

  // Update local state when ocrResult changes
  React.useEffect(() => {
    if (ocrResult) {
      setFrontData(ocrResult.front || {});
      setBackData(ocrResult.back || {});
    }
  }, [ocrResult]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFrontChange = (field, value) => {
    setFrontData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBackChange = (field, value) => {
    setBackData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfirm = () => {
    const corrected = {
      front: frontData,
      back: backData,
    };
    onConfirm(corrected);
  };

  const handleCancel = () => {
    setEditMode(false);
    onCancel?.();
  };

  if (!ocrResult) return null;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>Xác nhận thông tin CCCD</span>
          {isLoading && <CircularProgress size={20} />}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Confidence Alert */}
        {ocrResult.confidence < 0.8 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertCircle size={16} style={{ marginRight: '8px' }} />
            Độ chính xác: {Math.round(ocrResult.confidence * 100)}% - Vui lòng kiểm tra kỹ
          </Alert>
        )}

        {/* Quality Alert */}
        {ocrResult.imageQuality === 'poor' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Chất lượng ảnh không tốt - Hãy chụp lại ảnh sáng hơn
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Mặt trước" />
            <Tab label="Mặt sau" />
          </Tabs>
        </Box>

        {/* Front Side */}
        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Số CCCD"
              value={frontData.citizenId || ''}
              onChange={(e) => handleFrontChange('citizenId', e.target.value)}
              disabled={!editMode}
              fullWidth
              size="small"
              placeholder="123456789012"
              helperText={
                frontData.citizenId?.length === 12
                  ? '✓ Hợp lệ'
                  : `${frontData.citizenId?.length || 0}/12 số`
              }
              error={
                frontData.citizenId && frontData.citizenId.length !== 12
                  ? true
                  : false
              }
            />

            <TextField
              label="Họ tên"
              value={frontData.fullName || ''}
              onChange={(e) => handleFrontChange('fullName', e.target.value)}
              disabled={!editMode}
              fullWidth
              size="small"
              placeholder="Nguyễn Văn A"
              error={!frontData.fullName}
              helperText={frontData.fullName ? '✓' : 'Bắt buộc'}
            />

            <TextField
              label="Ngày sinh"
              value={frontData.birthDate || ''}
              onChange={(e) => handleFrontChange('birthDate', e.target.value)}
              disabled={!editMode}
              fullWidth
              size="small"
              placeholder="01/01/1990"
              helperText="Định dạng: DD/MM/YYYY"
            />

            <TextField
              label="Giới tính"
              value={frontData.gender || ''}
              onChange={(e) => handleFrontChange('gender', e.target.value)}
              disabled={!editMode}
              fullWidth
              size="small"
              placeholder="Nam"
            />
          </Box>
        )}

        {/* Back Side */}
        {tabValue === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nơi cư trú"
              value={backData.permanentAddress || ''}
              onChange={(e) => handleBackChange('permanentAddress', e.target.value)}
              disabled={!editMode}
              fullWidth
              multiline
              rows={3}
              size="small"
              placeholder="Địa chỉ cư trú"
            />

            <TextField
              label="Ngày cấp"
              value={backData.issuanceDate || ''}
              onChange={(e) => handleBackChange('issuanceDate', e.target.value)}
              disabled={!editMode}
              fullWidth
              size="small"
              placeholder="01/01/2020"
              helperText="Định dạng: DD/MM/YYYY"
            />

            <TextField
              label="Ngày hết hạn"
              value={backData.expiryDate || ''}
              onChange={(e) => handleBackChange('expiryDate', e.target.value)}
              disabled={!editMode}
              fullWidth
              size="small"
              placeholder="01/01/2030"
              helperText="Định dạng: DD/MM/YYYY"
            />

            <TextField
              label="Cơ quan cấp"
              value={backData.issuer || ''}
              onChange={(e) => handleBackChange('issuer', e.target.value)}
              disabled={!editMode}
              fullWidth
              size="small"
              placeholder="Công an tỉnh"
            />
          </Box>
        )}

        {/* Edit Mode Toggle */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant={editMode ? 'contained' : 'outlined'}
            size="small"
            startIcon={<Edit size={16} />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Hoàn tất chỉnh sửa' : 'Chỉnh sửa'}
          </Button>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={isLoading}>
          Hủy
        </Button>
        <Button
          onClick={() => setTabValue(1)}
          variant="outlined"
          disabled={isLoading}
        >
          Tab tiếp theo
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isLoading}
          startIcon={<Check size={16} />}
        >
          {isLoading ? 'Xử lý...' : 'Xác nhận & Điền form'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
