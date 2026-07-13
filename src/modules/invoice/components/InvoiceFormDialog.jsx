import { useState, useEffect, useCallback } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, CircularProgress, Alert, Divider,
} from '@mui/material';
import { Zap, Droplet, Wifi, Settings, ChevronRight, X, Receipt, Camera } from 'lucide-react';
import { InvoiceService } from '../services/InvoiceService';
import { MeterReadingForm } from '../../meter-reading/components/MeterReadingForm';

// ─── Giá trị mặc định khi không có utility_prices trong DB
const DEFAULT_PRICES = {
    electricPrice: 3500,
    waterPrice: 15000,
    internetPrice: 0,
    servicePrice: 0,
};

// ─── Tính tổng theo công thức DB schema
function calcTotal(d) {
    const electricFee = (d.electricUsage || 0) * (d.electricPrice || 0);
    const waterFee = (d.waterUsage || 0) * (d.waterPrice || 0);
    return (
        (d.roomFee || 0) +
        electricFee +
        waterFee +
        (d.internetFee || 0) +
        (d.serviceFee || 0) -
        (d.discount || 0)
    );
}

export function InvoiceFormDialog({ open, onClose, onSuccess, editInvoice }) {
    const [step, setStep] = useState(1); // 1 = chọn phòng, 2 = nhập chỉ số
    const [contracts, setContracts] = useState([]);
    const [loadingContracts, setLoadingContracts] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);

    // Dữ liệu chỉ số
    const [electricOld, setElectricOld] = useState(0);
    const [waterOld, setWaterOld] = useState(0);
    const [electricNew, setElectricNew] = useState('');
    const [waterNew, setWaterNew] = useState('');

    // Giá dịch vụ
    const [electricPrice, setElectricPrice] = useState(DEFAULT_PRICES.electricPrice);
    const [waterPrice, setWaterPrice] = useState(DEFAULT_PRICES.waterPrice);
    const [internetFee, setInternetFee] = useState(0);
    const [serviceFee, setServiceFee] = useState(0);
    const [discount, setDiscount] = useState(0);

    // Ngày đến hạn
    const currentMonth = new Date().toISOString().slice(0, 7);
    const defaultDueDate = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 15);
        return d.toISOString().split('T')[0];
    })();
    const [dueDate, setDueDate] = useState(defaultDueDate);

    // OCR dialog
    const [meterDialogType, setMeterDialogType] = useState(null); // 'electric' | 'water'

    // Submit
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [loadingAuto, setLoadingAuto] = useState(false);

    // Fetch hợp đồng ACTIVE và hóa đơn tháng này khi mở dialog
    useEffect(() => {
        if (!open) return;
        
        if (editInvoice) {
            setStep(2);
            setSelectedContract({
                roomId: editInvoice.roomId,
                contractId: editInvoice.contractId,
                propertyId: editInvoice.propertyId,
                roomCode: editInvoice.roomCode,
                tenantName: editInvoice.representativeTenantName,
                currentPrice: editInvoice.roomFee,
            });
            setElectricPrice(editInvoice.electricPrice || DEFAULT_PRICES.electricPrice);
            setWaterPrice(editInvoice.waterPrice || DEFAULT_PRICES.waterPrice);
            setInternetFee(editInvoice.internetFee || 0);
            setServiceFee(editInvoice.serviceFee || 0);
            setDiscount(editInvoice.discount || 0);
            setDueDate(editInvoice.dueDate || defaultDueDate);

            setLoadingAuto(true);
            InvoiceService.getLatestMeterReading(editInvoice.roomId, editInvoice.contractId)
                .then(res => {
                    if (res.success && res.data) {
                        if (res.data.month === editInvoice.month) {
                            setElectricOld(res.data.electricOld ?? 0);
                            setWaterOld(res.data.waterOld ?? 0);
                            setElectricNew(String(res.data.electricNew ?? 0));
                            setWaterNew(String(res.data.waterNew ?? 0));
                        } else {
                            setElectricOld(res.data.electricNew ?? 0);
                            setWaterOld(res.data.waterNew ?? 0);
                            setElectricNew(String((res.data.electricNew ?? 0) + (editInvoice.electricUsage || 0)));
                            setWaterNew(String((res.data.waterNew ?? 0) + (editInvoice.waterUsage || 0)));
                        }
                    } else {
                        setElectricOld(0);
                        setWaterOld(0);
                        setElectricNew(String(editInvoice.electricUsage || 0));
                        setWaterNew(String(editInvoice.waterUsage || 0));
                    }
                })
                .finally(() => setLoadingAuto(false));
        } else {
            setLoadingContracts(true);
            Promise.all([
                InvoiceService.getActiveContractsWithDetails(),
                InvoiceService.getInvoices({ month: currentMonth })
            ])
                .then(([contractRes, invoiceRes]) => {
                    if (contractRes.success && invoiceRes.success) {
                        const invoicesCurrentMonth = invoiceRes.data;
                        const invoicedRoomIds = new Set(invoicesCurrentMonth.map(inv => inv.roomId));
                        
                        const availableContracts = contractRes.data.filter(
                            c => !invoicedRoomIds.has(c.roomId)
                        );
                        setContracts(availableContracts);
                    } else {
                        setError('Không thể tải danh sách phòng');
                    }
                })
                .catch(() => setError('Lỗi khi lấy danh sách phòng'))
                .finally(() => setLoadingContracts(false));
        }
    }, [open, currentMonth, editInvoice, defaultDueDate]);

    // Khi chọn phòng → auto-load dữ liệu
    const handleSelectContract = useCallback(async (contract) => {
        setSelectedContract(contract);
        setStep(2);
        setError('');
        setLoadingAuto(true);

        try {
            // Load song song: meter reading cũ nhất + utility prices
            const [meterRes, priceRes] = await Promise.all([
                InvoiceService.getLatestMeterReading(contract.roomId, contract.id),
                InvoiceService.getUtilityPrices(contract.propertyId),
            ]);

            if (meterRes.success && meterRes.data) {
                setElectricOld(meterRes.data.electricNew ?? 0);
                setWaterOld(meterRes.data.waterNew ?? 0);
            } else {
                setElectricOld(0);
                setWaterOld(0);
            }

            if (priceRes.success && priceRes.data) {
                setElectricPrice(priceRes.data.electricPrice ?? DEFAULT_PRICES.electricPrice);
                setWaterPrice(priceRes.data.waterPrice ?? DEFAULT_PRICES.waterPrice);
                setInternetFee(priceRes.data.internetPrice ?? 0);
                setServiceFee(priceRes.data.servicePrice ?? 0);
            } else {
                setElectricPrice(DEFAULT_PRICES.electricPrice);
                setWaterPrice(DEFAULT_PRICES.waterPrice);
                setInternetFee(0);
                setServiceFee(0);
            }
        } catch {
            setError('Không thể tải dữ liệu tự động. Vui lòng nhập thủ công.');
        } finally {
            setLoadingAuto(false);
        }
    }, []);

    const handleReset = () => {
        setStep(1);
        setSelectedContract(null);
        setElectricOld(0);
        setWaterOld(0);
        setElectricNew('');
        setWaterNew('');
        setElectricPrice(DEFAULT_PRICES.electricPrice);
        setWaterPrice(DEFAULT_PRICES.waterPrice);
        setInternetFee(0);
        setServiceFee(0);
        setDiscount(0);
        setDueDate(defaultDueDate);
        setError('');
        setSaving(false);
        setDeleting(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    // Derived values
    const electricUsage = Math.max(0, (parseFloat(electricNew) || 0) - electricOld);
    const waterUsage = Math.max(0, (parseFloat(waterNew) || 0) - waterOld);
    const electricFee = electricUsage * electricPrice;
    const waterFee = waterUsage * waterPrice;
    const roomFee = selectedContract?.currentPrice || 0;
    const totalAmount = calcTotal({
        roomFee, electricUsage, electricPrice,
        waterUsage, waterPrice, internetFee, serviceFee, discount,
    });

    // Validation
    const electricNewNum = parseFloat(electricNew);
    const waterNewNum = parseFloat(waterNew);
    const electricError = electricNew !== '' && electricNewNum < electricOld;
    const waterError = waterNew !== '' && waterNewNum < waterOld;
    const canSubmit =
        electricNew !== '' && !electricError &&
        waterNew !== '' && !waterError &&
        !saving && !deleting;

    const handleDelete = async () => {
        if (!editInvoice) return;
        if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này không?")) return;
        
        setDeleting(true);
        setError('');
        
        try {
            const result = await InvoiceService.deleteInvoice(editInvoice.id);
            if (result.success) {
                onSuccess?.('delete');
                handleClose();
            } else {
                setError(result.error || 'Xóa hóa đơn thất bại');
            }
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi');
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async () => {
        if (!canSubmit || !selectedContract) return;
        setSaving(true);
        setError('');

        try {
            const invoiceData = {
                propertyId: selectedContract.propertyId,
                roomId: selectedContract.roomId,
                contractId: selectedContract.id,
                month: editInvoice ? editInvoice.month : currentMonth,
                roomFee,
                electricPrice,
                electricUsage,
                electricFee,
                waterPrice,
                waterUsage,
                waterFee,
                internetFee,
                serviceFee,
                discount,
                totalAmount,
                roomCode: selectedContract.roomCode,
                dueDate,
                tenantIds: selectedContract.representativeTenantId
                    ? [selectedContract.representativeTenantId]
                    : [],
                electricOld,
                electricNew: electricNewNum,
                waterOld,
                waterNew: waterNewNum,
            };

            let result;
            if (editInvoice) {
                result = await InvoiceService.updateInvoice(editInvoice.id, invoiceData);
            } else {
                result = await InvoiceService.createInvoice(invoiceData);
            }
            
            if (result.success) {
                onSuccess?.(editInvoice ? 'edit' : 'create');
                handleClose();
            } else {
                setError(result.error || (editInvoice ? 'Cập nhật hóa đơn thất bại' : 'Tạo hóa đơn thất bại'));
            }
        } catch (err) {
            setError(err.message || 'Đã xảy ra lỗi');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} fullScreen>
                <DialogTitle sx={{ p: 0 }}>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-white/80">
                                    {editInvoice ? 'Chỉnh sửa hóa đơn' : (step === 1 ? 'Bước 1/2' : `Bước 2/2 — Phòng ${selectedContract?.roomCode}`)}
                                </p>
                                <h2 className="text-xl font-semibold">
                                    {editInvoice ? `Phòng ${editInvoice.roomCode}` : (step === 1 ? 'Chọn phòng' : 'Nhập chỉ số & phí')}
                                </h2>
                                <p className="text-sm text-white/70 mt-0.5">Tháng {editInvoice ? editInvoice.month : currentMonth}</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-9 h-9 bg-white/20 hover:bg-white/35 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </DialogTitle>

                <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
                    <div className="p-4 flex flex-col gap-4">
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: '12px' }}>
                                {error}
                            </Alert>
                        )}

                        {/* ─── STEP 1: Chọn phòng ─── */}
                        {step === 1 && (
                            <div>
                                {loadingContracts ? (
                                    <div className="flex justify-center py-12">
                                        <CircularProgress sx={{ color: '#667eea' }} />
                                    </div>
                                ) : contracts.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <Receipt size={48} className="mx-auto mb-3 text-gray-300" />
                                        <p className="font-medium">Không có phòng nào cần tạo hóa đơn</p>
                                        <p className="text-sm mt-1">Tất cả các phòng (đang có khách) đều đã được tạo hóa đơn trong tháng này.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm text-gray-500">
                                            Chỉ hiển thị phòng có hợp đồng đang hiệu lực.
                                        </p>
                                        {contracts.map((contract) => (
                                            <button
                                                key={contract.id}
                                                onClick={() => handleSelectContract(contract)}
                                                className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-2xl transition-all text-left shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                        {contract.roomCode?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            Phòng {contract.roomCode}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {contract.tenantName || 'Chưa có khách'}
                                                        </p>
                                                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                                                            {(contract.currentPrice || 0).toLocaleString('vi-VN')} ₫/tháng
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={20} className="text-gray-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── STEP 2: Nhập chỉ số & phí ─── */}
                        {step === 2 && (
                            <>
                                {loadingAuto && (
                                    <div className="flex items-center gap-2 text-indigo-600 text-sm py-2">
                                        <CircularProgress size={16} sx={{ color: 'inherit' }} />
                                        Đang tải dữ liệu tự động...
                                    </div>
                                )}

                                {/* Tiền phòng */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
                                    <p className="text-sm text-white/80">Tiền phòng</p>
                                    <p className="text-2xl font-bold mt-0.5">
                                        {roomFee.toLocaleString('vi-VN')} ₫
                                    </p>
                                </div>

                                {/* Chỉ số điện */}
                                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                            <Zap size={16} className="text-white" />
                                        </div>
                                        <p className="font-medium text-gray-800">Điện</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="text-center p-2 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500">Chỉ số cũ</p>
                                            <p className="text-lg font-bold text-gray-700">{electricOld}</p>
                                            <p className="text-xs text-gray-400">kWh</p>
                                        </div>
                                        <div className="text-center p-2 bg-indigo-50 rounded-xl">
                                            <p className="text-xs text-gray-500">Tiêu thụ</p>
                                            <p className="text-lg font-bold text-indigo-600">{electricUsage}</p>
                                            <p className="text-xs text-gray-400">kWh</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mb-2">
                                        <TextField
                                            label="Chỉ số mới (kWh)"
                                            type="number"
                                            value={electricNew}
                                            onChange={e => setElectricNew(e.target.value)}
                                            fullWidth
                                            size="small"
                                            error={electricError}
                                            helperText={electricError ? 'Chỉ số mới phải ≥ chỉ số cũ' : ''}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            inputProps={{ min: electricOld }}
                                        />
                                        <Button
                                            variant="outlined"
                                            onClick={() => setMeterDialogType('electric')}
                                            sx={{ borderRadius: '12px', minWidth: 48, px: 1 }}
                                            title="Chụp ảnh OCR"
                                        >
                                            <Camera size={18} />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600 bg-yellow-50 rounded-xl p-2">
                                        <span>
                                            Đơn giá: {electricPrice.toLocaleString('vi-VN')} ₫/kWh
                                        </span>
                                        <span className="font-semibold text-yellow-700">
                                            = {electricFee.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>
                                </section>

                                {/* Chỉ số nước */}
                                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                                            <Droplet size={16} className="text-white" />
                                        </div>
                                        <p className="font-medium text-gray-800">Nước</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="text-center p-2 bg-gray-50 rounded-xl">
                                            <p className="text-xs text-gray-500">Chỉ số cũ</p>
                                            <p className="text-lg font-bold text-gray-700">{waterOld}</p>
                                            <p className="text-xs text-gray-400">m³</p>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 rounded-xl">
                                            <p className="text-xs text-gray-500">Tiêu thụ</p>
                                            <p className="text-lg font-bold text-blue-600">{waterUsage}</p>
                                            <p className="text-xs text-gray-400">m³</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mb-2">
                                        <TextField
                                            label="Chỉ số mới (m³)"
                                            type="number"
                                            value={waterNew}
                                            onChange={e => setWaterNew(e.target.value)}
                                            fullWidth
                                            size="small"
                                            error={waterError}
                                            helperText={waterError ? 'Chỉ số mới phải ≥ chỉ số cũ' : ''}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                            inputProps={{ min: waterOld }}
                                        />
                                        <Button
                                            variant="outlined"
                                            onClick={() => setMeterDialogType('water')}
                                            sx={{ borderRadius: '12px', minWidth: 48, px: 1 }}
                                            title="Chụp ảnh OCR"
                                        >
                                            <Camera size={18} />
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 rounded-xl p-2">
                                        <span>
                                            Đơn giá: {waterPrice.toLocaleString('vi-VN')} ₫/m³
                                        </span>
                                        <span className="font-semibold text-blue-700">
                                            = {waterFee.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>
                                </section>

                                {/* Phí dịch vụ */}
                                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-lg flex items-center justify-center">
                                            <Settings size={16} className="text-white" />
                                        </div>
                                        <p className="font-medium text-gray-800">Phí dịch vụ</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextField
                                            label="Internet (₫)"
                                            type="number"
                                            value={internetFee}
                                            onChange={e => setInternetFee(Number(e.target.value) || 0)}
                                            size="small"
                                            InputProps={{ startAdornment: <Wifi size={14} className="mr-1 text-gray-400" /> }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                        <TextField
                                            label="Dịch vụ khác (₫)"
                                            type="number"
                                            value={serviceFee}
                                            onChange={e => setServiceFee(Number(e.target.value) || 0)}
                                            size="small"
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                    </div>
                                </section>

                                {/* Giảm giá & hạn thanh toán */}
                                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <TextField
                                            label="Giảm giá (₫)"
                                            type="number"
                                            value={discount}
                                            onChange={e => setDiscount(Number(e.target.value) || 0)}
                                            size="small"
                                            inputProps={{ min: 0 }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                        <TextField
                                            label="Hạn thanh toán"
                                            type="date"
                                            value={dueDate}
                                            onChange={e => setDueDate(e.target.value)}
                                            size="small"
                                            InputLabelProps={{ shrink: true }}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                                        />
                                    </div>
                                </section>

                                {/* Tổng cộng */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-4 text-white">
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                                    <div className="space-y-1.5 text-sm mb-3">
                                        <div className="flex justify-between opacity-80">
                                            <span>Tiền phòng</span>
                                            <span>{roomFee.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                        <div className="flex justify-between opacity-80">
                                            <span>Tiền điện</span>
                                            <span>{electricFee.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                        <div className="flex justify-between opacity-80">
                                            <span>Tiền nước</span>
                                            <span>{waterFee.toLocaleString('vi-VN')} ₫</span>
                                        </div>
                                        {internetFee > 0 && (
                                            <div className="flex justify-between opacity-80">
                                                <span>Internet</span>
                                                <span>{internetFee.toLocaleString('vi-VN')} ₫</span>
                                            </div>
                                        )}
                                        {serviceFee > 0 && (
                                            <div className="flex justify-between opacity-80">
                                                <span>Dịch vụ khác</span>
                                                <span>{serviceFee.toLocaleString('vi-VN')} ₫</span>
                                            </div>
                                        )}
                                        {discount > 0 && (
                                            <div className="flex justify-between opacity-80 text-green-300">
                                                <span>Giảm giá</span>
                                                <span>- {discount.toLocaleString('vi-VN')} ₫</span>
                                            </div>
                                        )}
                                    </div>
                                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium">Tổng cộng</span>
                                        <span className="text-2xl font-bold">
                                            {totalAmount.toLocaleString('vi-VN')} ₫
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>

                {step === 2 && (
                    <DialogActions sx={{ p: 2, gap: 1 }}>
                        {!editInvoice && (
                            <Button
                                onClick={() => setStep(1)}
                                variant="outlined"
                                fullWidth
                                sx={{ borderRadius: '12px' }}
                                disabled={saving || deleting}
                            >
                                Quay lại
                            </Button>
                        )}
                        {editInvoice && (
                            <Button
                                onClick={handleDelete}
                                variant="outlined"
                                color="error"
                                fullWidth
                                disabled={saving || deleting}
                                sx={{ borderRadius: '12px' }}
                            >
                                {deleting ? 'Đang xóa...' : 'Xóa hóa đơn'}
                            </Button>
                        )}
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            fullWidth
                            disabled={!canSubmit}
                            sx={{
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5568d3 0%, #65408a 100%)',
                                },
                            }}
                        >
                            {saving ? 'Đang lưu...' : (editInvoice ? 'Lưu thay đổi' : 'Tạo hóa đơn')}
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

            {/* OCR Dialog */}
            <Dialog
                open={meterDialogType !== null}
                onClose={() => setMeterDialogType(null)}
                fullScreen
            >
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen">
                    {meterDialogType && selectedContract && (
                        <MeterReadingForm
                            roomNumber={selectedContract.roomCode}
                            meterType={meterDialogType}
                            previousReading={meterDialogType === 'electric' ? electricOld : waterOld}
                            onConfirm={(reading) => {
                                if (meterDialogType === 'electric') {
                                    setElectricNew(String(reading));
                                } else {
                                    setWaterNew(String(reading));
                                }
                                setMeterDialogType(null);
                            }}
                            onCancel={() => setMeterDialogType(null)}
                        />
                    )}
                </div>
            </Dialog>
        </>
    );
}
