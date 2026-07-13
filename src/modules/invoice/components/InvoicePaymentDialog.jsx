import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { CreditCard, Banknote, Smartphone, CircleDollarSign, X } from 'lucide-react';

const PAYMENT_METHODS = [
    { value: 'CASH', label: 'Tiền mặt', icon: Banknote },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản', icon: CreditCard },
    { value: 'MOMO', label: 'MoMo', icon: Smartphone },
    { value: 'OTHER', label: 'Khác', icon: CircleDollarSign },
];

export function InvoicePaymentDialog({ open, onClose, invoice, onConfirm, loading }) {
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [transactionCode, setTransactionCode] = useState('');
    const [note, setNote] = useState('');

    const handleConfirm = () => {
        onConfirm({
            amount: invoice?.totalAmount || 0,
            paymentMethod,
            transactionCode: transactionCode.trim() || null,
            note: note.trim() || null,
        });
    };

    const handleClose = () => {
        setPaymentMethod('CASH');
        setTransactionCode('');
        setNote('');
        onClose();
    };

    if (!invoice) return null;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ p: 0 }}>
                <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-5 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-white/80">Xác nhận thanh toán</p>
                            <h2 className="text-lg font-semibold">
                                Phòng {invoice.roomCode} — Tháng {invoice.month}
                            </h2>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 bg-white/20 hover:bg-white/35 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 3 }}>
                {/* Số tiền */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl text-white text-center mb-4">
                    <p className="text-sm text-white/80 mb-1">Số tiền thanh toán</p>
                    <p className="text-3xl font-bold">
                        {(invoice.totalAmount || 0).toLocaleString('vi-VN')} ₫
                    </p>
                </div>

                {/* Phương thức */}
                <p className="text-sm font-medium text-gray-700 mb-2">Phương thức</p>
                <ToggleButtonGroup
                    value={paymentMethod}
                    exclusive
                    onChange={(_, v) => { if (v) setPaymentMethod(v); }}
                    fullWidth
                    size="small"
                    sx={{
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 0.5,
                        '& .MuiToggleButton-root': {
                            borderRadius: '10px !important',
                            border: '1px solid #e5e7eb !important',
                            flex: '1 1 40%',
                            flexDirection: 'column',
                            gap: 0.5,
                            py: 1,
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            fontWeight: 500,
                            color: '#6b7280',
                            '&.Mui-selected': {
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                borderColor: 'transparent !important',
                            },
                        },
                    }}
                >
                    {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                        <ToggleButton key={value} value={value}>
                            <Icon size={18} />
                            {label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                {/* Mã giao dịch (optional) */}
                <TextField
                    label="Mã giao dịch (nếu có)"
                    value={transactionCode}
                    onChange={e => setTransactionCode(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    placeholder="VD: TXN20250701..."
                />

                {/* Ghi chú */}
                <TextField
                    label="Ghi chú"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    placeholder="Ghi chú thêm..."
                />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: '12px' }}
                    disabled={loading}
                >
                    Hủy
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        },
                    }}
                >
                    {loading ? 'Đang lưu...' : 'Xác nhận'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
