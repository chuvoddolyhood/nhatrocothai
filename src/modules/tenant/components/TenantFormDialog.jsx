import { useState, useEffect, useRef } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box } from '@mui/material';
import { INITIAL_TENANT_FORM_DATA } from '../dto/TenantDTO';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { TenantService } from '../services/TenantService';
import { useNotification } from '../../../shared/hooks/useNotification';
import { Camera, AlertCircle, Zap } from 'lucide-react';
import { CccdImage } from './CccdImage';
import { useOcr } from '../hooks/useOcr';
import OcrResultsDialog from './OcrResultsDialog';
import CameraDialog from './CameraDialog';

export function TenantFormDialog({ open, onClose, onSuccess, editingTenant }) {
    const [formData, setFormData] = useState(INITIAL_TENANT_FORM_DATA);
    const [originalData, setOriginalData] = useState(INITIAL_TENANT_FORM_DATA);
    const { showSuccess, showError } = useNotification();
    const ocr = useOcr();

    // OCR states
    const [ocrResultDialogOpen, setOcrResultDialogOpen] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [capturedSide, setCapturedSide] = useState(null); // 'front' or 'back'
    const [isOcrProcessing, setIsOcrProcessing] = useState(false);
    const [useOcrFlow, setUseOcrFlow] = useState(false); // Toggle between OCR and simple camera

    // Legacy camera states (kept for compatibility)
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraSide, setCameraSide] = useState(null); // 'front' | 'back'
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Camera handling functions
    useEffect(() => {
        let activeStream = null;
        async function startCamera() {
            if (cameraOpen && cameraSide) {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' }
                    });
                    activeStream = mediaStream;
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error("Error starting camera: ", err);
                    showError("Không thể truy cập camera. Vui lòng cấp quyền truy cập camera trong trình duyệt.");
                    setCameraOpen(false);
                    setCameraSide(null);
                }
            }
        }

        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraOpen, cameraSide]);

    /**
     * Handle capture from OCR camera dialog
     */
    const handleOcrCaptureComplete = async (captures) => {
        try {
            setIsOcrProcessing(true);
            setOcrResult(null);

            // Perform OCR on front side
            if (captures.front) {
                const result = await ocr.performOcr('front');
                if (result) {
                    setOcrResult(result);
                    setCapturedSide('front');
                    setOcrResultDialogOpen(true);
                }
            }

            // Store captures for later
            setFormData(prev => ({
                ...prev,
                citizenIdFrontUrl: captures.front?.image || prev.citizenIdFrontUrl,
                citizenIdBackUrl: captures.back?.image || prev.citizenIdBackUrl,
            }));
        } catch (error) {
            console.error('OCR error:', error);
            showError('Lỗi xử lý OCR: ' + error.message);
        } finally {
            setIsOcrProcessing(false);
        }
    };

    /**
     * Handle OCR results confirmation
     */
    const handleOcrResultsConfirm = async (correctedData) => {
        try {
            // Log the OCR data for training
            await ocr.logOcrData(ocrResult, correctedData, true);

            // Auto-fill form with corrected data
            if (correctedData.front) {
                setFormData(prev => ({
                    ...prev,
                    fullName: correctedData.front.fullName || prev.fullName,
                    citizenId: correctedData.front.citizenId || prev.citizenId,
                    birthDate: correctedData.front.birthDate || prev.birthDate,
                }));
            }

            if (correctedData.back) {
                setFormData(prev => ({
                    ...prev,
                    permanentAddress: correctedData.back.permanentAddress || prev.permanentAddress,
                }));
            }

            setOcrResultDialogOpen(false);
            showSuccess('Thông tin được điền tự động từ CCCD');
        } catch (error) {
            console.error('Error confirming OCR results:', error);
            showError('Lỗi khi lưu dữ liệu');
        }
    };

    const handleCloseOcrResultsDialog = () => {
        setOcrResultDialogOpen(false);
        // If user closes without confirming, we still keep the captured images
    };

    // Legacy camera handling functions

    const handleCloseCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraOpen(false);
        setCameraSide(null);
    };

    const handleCloseDialog = () => {
        handleCloseCamera();
        onClose();
    };

    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');

            setFormData(prev => ({
                ...prev,
                [cameraSide === 'front' ? 'citizenIdFrontUrl' : 'citizenIdBackUrl']: dataUrl
            }));

            handleCloseCamera();
        }
    };

    useEffect(() => {
        if (editingTenant) {
            const tenantData = {
                fullName: editingTenant.fullName || '',
                phone: editingTenant.phone || '',
                citizenId: editingTenant.citizenId || '',
                birthDate: editingTenant.birthDate || '',
                permanentAddress: editingTenant.permanentAddress || '',
                citizenIdFrontUrl: editingTenant.citizenIdFrontUrl || '',
                citizenIdBackUrl: editingTenant.citizenIdBackUrl || '',
            };
            setFormData(tenantData);
            setOriginalData(tenantData);
        } else {
            setFormData(INITIAL_TENANT_FORM_DATA);
            setOriginalData(INITIAL_TENANT_FORM_DATA);
        }
    }, [editingTenant, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let result;
            if (editingTenant) {
                result = await TenantService.updateTenant(editingTenant.id, formData);
            } else {
                result = await TenantService.addTenant(formData);
            }

            if (result.success) {
                showSuccess(editingTenant ? "Cập nhật khách thuê thành công" : "Thêm khách thuê thành công");
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            } else {
                showError(result.error || "Thao tác thất bại");
            }
        } catch (error) {
            showError(error);
        }
    };

    // Check if form data has changed from original
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(originalData);

    // Check if all required fields are filled
    const isFormValid = formData.citizenIdFrontUrl && formData.citizenIdBackUrl;

    // Submit button should be enabled when:
    // - For new tenant: all required fields filled
    // - For editing tenant: data has changed AND all required fields filled
    const isSubmitDisabled = editingTenant
        ? !hasChanged || !isFormValid
        : !isFormValid;

    return (
        <Dialog open={open} onClose={handleCloseDialog} fullScreen>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <DialogTitle>{editingTenant ? 'Sửa thông tin khách thuê' : 'Thêm khách thuê mới'}</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-6 pt-2">
                        <TextField
                            label="Họ và tên"
                            slotProps={{
                                htmlInput: {
                                    maxLength: 100
                                }
                            }}
                            fullWidth
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />

                        <TextField
                            label="Số điện thoại"
                            type="tel"
                            fullWidth
                            required
                            slotProps={{
                                htmlInput: {
                                    maxLength: 9
                                }
                            }}
                            value={formData.phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');

                                setFormData({
                                    ...formData,
                                    phone: value,
                                });
                            }}
                        />

                        <TextField
                            label="Số CCCD/CMND"
                            fullWidth
                            required
                            slotProps={{
                                htmlInput: {
                                    maxLength: 12
                                }
                            }}
                            value={formData.citizenId}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                setFormData({ ...formData, citizenId: value })
                            }}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Ngày sinh"
                                value={formData.birthDate ? dayjs(formData.birthDate) : null}
                                onChange={(newValue) =>
                                    setFormData({
                                        ...formData,
                                        birthDate: newValue?.format('YYYY-MM-DD') || ''
                                    })
                                }
                                slotProps={{
                                    textField: {
                                        required: true,
                                        fullWidth: true,
                                    },
                                }}
                            />
                        </LocalizationProvider>

                        <TextField
                            label="Địa chỉ thường trú"
                            fullWidth
                            required
                            multiline
                            rows={2}
                            helperText={`${formData.permanentAddress.length}/255`}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 255
                                }
                            }}
                            value={formData.permanentAddress}
                            onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                        />

                        {/* Photo capture section */}
                        <div className="flex flex-col gap-2 mt-2">
                            <label className="text-sm font-semibold text-gray-700">
                                Ảnh Căn cước công dân (Bắt buộc)
                            </label>
                            
                            {/* Toggle Slider */}
                            <div className="relative inline-flex bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl shadow-inner mt-1 mb-2 w-full sm:w-80">
                                <div 
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
                                        useOcrFlow ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                                    }`}
                                />
                                
                                <button 
                                    type="button"
                                    onClick={() => setUseOcrFlow(false)}
                                    className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                                        !useOcrFlow ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Camera size={16} />
                                    Camera thường
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => setUseOcrFlow(true)}
                                    className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors duration-300 ${
                                        useOcrFlow ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Zap size={16} className={useOcrFlow ? "text-amber-500" : ""} />
                                    OCR (AI)
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                                {/* Front Side */}
                                <div className="flex flex-col gap-1">
                                    {formData.citizenIdFrontUrl ? (
                                        <CccdImage
                                            url={formData.citizenIdFrontUrl}
                                            label="Mặt trước CCCD"
                                            onRetake={() => {
                                                if (useOcrFlow) {
                                                    ocr.setCurrentSide('front');
                                                } else {
                                                    setCameraSide('front');
                                                    setCameraOpen(true);
                                                }
                                            }}
                                            onDelete={() => setFormData(prev => ({ ...prev, citizenIdFrontUrl: '' }))}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (useOcrFlow) {
                                                    ocr.setCurrentSide('front');
                                                    // CameraDialog will be opened via state
                                                } else {
                                                    setCameraSide('front');
                                                    setCameraOpen(true);
                                                }
                                            }}
                                            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl aspect-[1.586] bg-gray-50/50 transition-all cursor-pointer group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-indigo-600 transition-colors">
                                                <Camera size={20} />
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium group-hover:text-indigo-600 transition-colors">
                                                {useOcrFlow ? 'Chụp (AI)' : 'Chụp ảnh'}
                                            </span>
                                        </button>
                                    )}
                                </div>

                                {/* Back Side */}
                                <div className="flex flex-col gap-1">
                                    {formData.citizenIdBackUrl ? (
                                        <CccdImage
                                            url={formData.citizenIdBackUrl}
                                            label="Mặt sau CCCD"
                                            onRetake={() => {
                                                if (useOcrFlow) {
                                                    ocr.setCurrentSide('back');
                                                } else {
                                                    setCameraSide('back');
                                                    setCameraOpen(true);
                                                }
                                            }}
                                            onDelete={() => setFormData(prev => ({ ...prev, citizenIdBackUrl: '' }))}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (useOcrFlow) {
                                                    ocr.setCurrentSide('back');
                                                    // CameraDialog will be opened via state
                                                } else {
                                                    setCameraSide('back');
                                                    setCameraOpen(true);
                                                }
                                            }}
                                            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50/20 rounded-xl aspect-[1.586] bg-gray-50/50 transition-all cursor-pointer group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400 group-hover:text-indigo-600 transition-colors">
                                                <Camera size={20} />
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium group-hover:text-indigo-600 transition-colors">
                                                {useOcrFlow ? 'Chụp (AI)' : 'Chụp ảnh'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {(!formData.citizenIdFrontUrl || !formData.citizenIdBackUrl) && (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200 mt-3 text-xs font-medium">
                                    <AlertCircle size={16} />
                                    <span>Vui lòng chụp đầy đủ cả mặt trước và mặt sau CCCD để có thể lưu thông tin.</span>
                                </div>
                            )}

                            {/* Removed old toggle */}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitDisabled}
                        sx={{
                            background: isSubmitDisabled
                                ? undefined
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: isSubmitDisabled
                                    ? undefined
                                    : 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)',
                            }
                        }}
                    >
                        {editingTenant ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </form>

            {/* Camera Sub-dialog */}
            <Dialog
                open={cameraOpen}
                onClose={handleCloseCamera}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#121212',
                        borderRadius: '24px',
                        color: 'white',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <span className="font-semibold text-lg">Chụp ảnh {cameraSide === 'front' ? 'mặt trước' : 'mặt sau'}</span>
                </DialogTitle>
                <DialogContent sx={{ p: 0, position: 'relative', bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '70vh', objectFit: 'cover' }}
                    />

                    {/* Scanner/Alignment Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8">
                        <div className="w-full aspect-[1.586] border-2 border-dashed border-indigo-400 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] flex items-center justify-center relative">
                            <div className="text-white text-xs font-semibold bg-indigo-600/90 px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm">
                                Căn chỉnh {cameraSide === 'front' ? 'mặt trước' : 'mặt sau'} CCCD vào khung
                            </div>
                        </div>
                    </div>

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </DialogContent>
                <DialogActions sx={{ p: 2.5, justifyContent: 'center', gap: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button
                        onClick={handleCloseCamera}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', borderRadius: '10px', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                        variant="outlined"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleCapture}
                        color="primary"
                        variant="contained"
                        startIcon={<Camera size={18} />}
                        sx={{
                            borderRadius: '10px',
                            px: 4,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)',
                            }
                        }}
                    >
                        Chụp ảnh
                    </Button>
                </DialogActions>
            </Dialog>

            {/* OCR Camera Dialog */}
            <CameraDialog
                open={useOcrFlow && (ocr.currentSide === 'front' || ocr.currentSide === 'back')}
                onClose={() => ocr.reset()}
                onCaptureComplete={handleOcrCaptureComplete}
                initialSide={ocr.currentSide}
                ocr={ocr}
            />

            {/* OCR Results Verification Dialog */}
            <OcrResultsDialog
                open={ocrResultDialogOpen}
                onClose={handleCloseOcrResultsDialog}
                ocrResult={ocrResult}
                isLoading={isOcrProcessing}
                onConfirm={handleOcrResultsConfirm}
                onCancel={handleCloseOcrResultsDialog}
            />

        </Dialog>
    );
}
