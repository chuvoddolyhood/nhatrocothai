import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, CircularProgress } from '@mui/material';
import { Receipt, X, Zap, Droplet, Check, Calendar } from 'lucide-react';
import { InvoiceService } from '../../invoice/services/InvoiceService';
import { InvoiceDetailDialog } from '../../invoice/components/InvoiceDetailDialog';

function formatDate(dateStr) {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

// ─── Mini invoice status badge ───────────────────────────────────────────────
function InvoiceBadge({ status }) {
    const map = {
        PAID: { label: 'Đã thanh toán', bg: '#dcfce7', color: '#166534' },
        UNPAID: { label: 'Chưa thanh toán', bg: '#fef3c7', color: '#92400e' },
        OVERDUE: { label: 'Quá hạn', bg: '#fee2e2', color: '#991b1b' },
        PARTIAL: { label: 'Thanh toán một phần', bg: '#dbeafe', color: '#1e40af' },
        CANCELLED: { label: 'Đã hủy', bg: '#f3f4f6', color: '#6b7280' },
    };
    const cfg = map[status] || { label: status, bg: '#f3f4f6', color: '#6b7280' };
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.6rem', height: '18px' }}
        />
    );
}

// ─── Invoice list sheet (shown as a stacked Dialog) ──────────────────────────
export function ContractInvoicesDialog({ open, onClose, contractId, roomCode }) {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [detailInvoice, setDetailInvoice] = useState(null);

    // Fetch hóa đơn khi mở dialog
    useEffect(() => {
        if (!open) return;
        
        let isMounted = true;
        
        const fetchInvoices = async () => {
            setLoading(true);
            try {
                const res = await InvoiceService.getInvoices({ contractId });
                if (isMounted && res.success) {
                    setInvoices(res.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchInvoices();
        
        return () => {
            isMounted = false;
        };
    }, [open, contractId]);

    const handleClose = () => {
        setInvoices([]);
        setLoading(false);
        onClose();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="sm"
                slotProps={{
                    paper: {
                        sx: { borderRadius: '20px', mx: 2, maxHeight: '80vh' }
                    }
                }}
            >
                <DialogTitle sx={{ p: 0 }}>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3.5 text-white rounded-t-[20px]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center">
                                    <Receipt size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-white/75">Hóa đơn hợp đồng</p>
                                    <h2 className="text-base font-semibold leading-tight">
                                        {roomCode ? `Phòng ${roomCode}` : `HĐ #${contractId}`}
                                    </h2>
                                </div>
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

                <DialogContent sx={{ p: 0, overflowY: 'auto', bgcolor: '#f8fafc' }}>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <CircularProgress size={28} sx={{ color: '#667eea' }} />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                            <Receipt size={40} className="text-gray-200" />
                            <p className="font-medium text-gray-500">Chưa có hóa đơn nào</p>
                            <p className="text-sm">cho hợp đồng này</p>
                        </div>
                    ) : (
                        <div className="p-3 flex flex-col gap-2.5">
                            {invoices.map((inv) => {
                                const isPaid = inv.status === 'PAID';
                                return (
                                    <div
                                        key={inv.id}
                                        className={`rounded-xl border overflow-hidden shadow-sm ${isPaid ? 'border-green-200' : 'border-gray-200'}`}
                                    >
                                        {/* Mini header */}
                                        <div className={`px-3 py-2 flex items-center justify-between ${isPaid ? 'bg-green-50' : 'bg-white'}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-gray-800">
                                                    Tháng {inv.month}
                                                </span>
                                                <InvoiceBadge status={inv.status} />
                                            </div>
                                            <span className="text-sm font-bold text-indigo-600">
                                                {(inv.totalAmount || 0).toLocaleString('vi-VN')} ₫
                                            </span>
                                        </div>

                                        {/* Quick breakdown */}
                                        <div className="bg-white px-3 pb-2.5 flex flex-col gap-1.5 border-t border-gray-100">
                                            <div className="grid grid-cols-3 gap-2 pt-2">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-400">Tiền phòng</p>
                                                    <p className="text-xs font-semibold text-gray-700 mt-0.5">
                                                        {(inv.roomFee || 0).toLocaleString('vi-VN')} ₫
                                                    </p>
                                                </div>
                                                <div className="text-center border-x border-gray-100">
                                                    <div className="flex items-center justify-center gap-0.5 text-yellow-500">
                                                        <Zap size={10} />
                                                        <p className="text-xs text-gray-400">Điện</p>
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-700 mt-0.5">
                                                        {(inv.electricFee || 0).toLocaleString('vi-VN')} ₫
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center gap-0.5 text-blue-500">
                                                        <Droplet size={10} />
                                                        <p className="text-xs text-gray-400">Nước</p>
                                                    </div>
                                                    <p className="text-xs font-semibold text-gray-700 mt-0.5">
                                                        {(inv.waterFee || 0).toLocaleString('vi-VN')} ₫
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Paid date or due date */}
                                            {isPaid && inv.paidAt && (
                                                <div className="flex items-center gap-1 text-xs text-green-600">
                                                    <Check size={11} />
                                                    <span>Đã thanh toán {formatDate(inv.paidAt)}</span>
                                                </div>
                                            )}
                                            {!isPaid && inv.dueDate && (
                                                <div className="flex items-center gap-1 text-xs text-orange-500">
                                                    <Calendar size={11} />
                                                    <span>Hạn: {formatDate(inv.dueDate)}</span>
                                                </div>
                                            )}

                                            {/* Action */}
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<Receipt size={13} />}
                                                onClick={() => setDetailInvoice(inv)}
                                                fullWidth
                                                sx={{
                                                    mt: 0.5,
                                                    borderRadius: '8px',
                                                    fontSize: '0.72rem',
                                                    borderColor: '#c7d2fe',
                                                    color: '#4f46e5',
                                                    '&:hover': { borderColor: '#818cf8', bgcolor: '#eef2ff' },
                                                }}
                                            >
                                                Xem chi tiết hóa đơn
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 1.5 }}>
                    <Button onClick={handleClose} fullWidth variant="outlined" sx={{ borderRadius: '10px' }}>
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invoice detail (stacked on top) */}
            <InvoiceDetailDialog
                open={detailInvoice !== null}
                onClose={() => setDetailInvoice(null)}
                invoice={detailInvoice}
            />
        </>
    );
}
