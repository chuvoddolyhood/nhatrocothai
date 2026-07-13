import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Divider } from '@mui/material';
import { Home, Calendar, User, Zap, Droplet, Wifi, Settings, Check, X, Share2, Receipt } from 'lucide-react';
import { InvoiceStatus, InvoiceStatusLabel } from '../constants/InvoiceStatus';

const statusConfig = {
    [InvoiceStatus.UNPAID]: { label: InvoiceStatusLabel.UNPAID, color: 'warning', gradient: 'from-orange-400 to-red-500' },
    [InvoiceStatus.PAID]: { label: InvoiceStatusLabel.PAID, color: 'success', gradient: 'from-emerald-400 to-teal-500' },
    OVERDUE: { label: 'Quá hạn', color: 'error', gradient: 'from-red-500 to-rose-600' },
    [InvoiceStatus.PARTIAL]: { label: InvoiceStatusLabel.PARTIAL, color: 'info', gradient: 'from-blue-400 to-indigo-500' },
    [InvoiceStatus.CANCELLED]: { label: InvoiceStatusLabel.CANCELLED, color: 'default', gradient: 'from-gray-400 to-gray-500' },
};

function Row({ label, value, className = '' }) {
    return (
        <div className={`flex justify-between items-center ${className}`}>
            <span className="text-gray-600 text-sm">{label}</span>
            <span className="font-medium text-sm text-right">{value}</span>
        </div>
    );
}

export function InvoiceDetailDialog({ open, onClose, invoice, onMarkPaid }) {
    if (!invoice) return null;

    const status = statusConfig[invoice.status] || { label: invoice.status, color: 'default', gradient: 'from-gray-400 to-gray-500' };
    const isPaid = invoice.status === InvoiceStatus.PAID;

    const handleShare = () => {
        const electricUsage = invoice.electricUsage ?? 0;
        const waterUsage = invoice.waterUsage ?? 0;
        const electricFee = invoice.electricFee ?? 0;
        const waterFee = invoice.waterFee ?? 0;

        const message = `
🏠 HÓA ĐƠN TIỀN NHÀ TRỌ
━━━━━━━━━━━━━━━━━━━━
📅 Tháng: ${invoice.month}
🚪 Phòng: ${invoice.roomCode}
👤 Khách thuê: ${invoice.representativeTenantName || '---'}

💰 CHI TIẾT:
━━━━━━━━━━━━━━━━━━━━
🏠 Tiền phòng: ${(invoice.roomFee || 0).toLocaleString('vi-VN')} ₫

⚡ Điện:
   Tiêu thụ: ${electricUsage} kWh × ${(invoice.electricPrice || 0).toLocaleString('vi-VN')} ₫
   Thành tiền: ${electricFee.toLocaleString('vi-VN')} ₫

💧 Nước:
   Tiêu thụ: ${waterUsage} m³ × ${(invoice.waterPrice || 0).toLocaleString('vi-VN')} ₫
   Thành tiền: ${waterFee.toLocaleString('vi-VN')} ₫
${invoice.internetFee > 0 ? `\n🌐 Internet: ${invoice.internetFee.toLocaleString('vi-VN')} ₫` : ''}
${invoice.serviceFee > 0 ? `🔧 Dịch vụ: ${invoice.serviceFee.toLocaleString('vi-VN')} ₫` : ''}
${invoice.discount > 0 ? `🎁 Giảm giá: -${invoice.discount.toLocaleString('vi-VN')} ₫` : ''}
━━━━━━━━━━━━━━━━━━━━
💵 TỔNG CỘNG: ${(invoice.totalAmount || 0).toLocaleString('vi-VN')} ₫
${isPaid
                ? `✅ Đã thanh toán ngày ${new Date(invoice.paidAt).toLocaleDateString('vi-VN')}`
                : `⏳ Hạn thanh toán: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}`}
━━━━━━━━━━━━━━━━━━━━
        `.trim();

        if (navigator.share) {
            navigator.share({
                title: `Hóa đơn phòng ${invoice.roomCode} tháng ${invoice.month}`,
                text: message,
            }).catch(() => {
                navigator.clipboard?.writeText(message);
            });
        } else {
            navigator.clipboard?.writeText(message);
            alert('Đã sao chép hóa đơn vào clipboard!');
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle sx={{ p: 0 }}>
                <div className={`bg-linear-to-r ${status.gradient} p-5 text-white`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center">
                                <Receipt size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-white/80">Chi tiết hóa đơn</p>
                                <h2 className="text-xl font-semibold">Phòng {invoice.roomCode}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Chip
                                        label={status.label}
                                        size="small"
                                        color={status.color}
                                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                    />
                                    <span className="text-xs text-white/70">Tháng {invoice.month}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 bg-white/20 hover:bg-white/35 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </DialogTitle>

            <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
                <div className="p-4 flex flex-col gap-4">

                    {/* Thông tin chung */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Thông tin chung
                        </p>
                        <div className="flex flex-col gap-2">
                            <Row label={<span className="flex items-center gap-1"><Home size={14} /> Phòng</span>} value={invoice.roomCode || '---'} />
                            <Row label={<span className="flex items-center gap-1"><User size={14} /> Khách thuê</span>} value={invoice.representativeTenantName || '---'} />
                            <Row label={<span className="flex items-center gap-1"><Calendar size={14} /> Tháng</span>} value={invoice.month} />
                            {invoice.dueDate && (
                                <Row
                                    label="Hạn thanh toán"
                                    value={new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                                />
                            )}
                        </div>
                    </section>

                    {/* Chi tiết thanh toán */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Chi tiết thanh toán
                        </p>

                        {/* Tiền phòng */}
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-700 flex items-center gap-2">
                                <Home size={16} className="text-indigo-500" /> Tiền phòng
                            </span>
                            <span className="font-medium">{(invoice.roomFee || 0).toLocaleString('vi-VN')} ₫</span>
                        </div>

                        <Divider />

                        {/* Điện */}
                        <div className="py-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 flex items-center gap-2">
                                    <Zap size={16} className="text-yellow-500" /> Tiền điện
                                </span>
                                <span className="font-medium">{(invoice.electricFee || 0).toLocaleString('vi-VN')} ₫</span>
                            </div>
                            <p className="text-xs text-gray-400 ml-6 mt-0.5">
                                {invoice.electricUsage ?? 0} kWh × {(invoice.electricPrice || 0).toLocaleString('vi-VN')} ₫/kWh
                            </p>
                        </div>

                        <Divider />

                        {/* Nước */}
                        <div className="py-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 flex items-center gap-2">
                                    <Droplet size={16} className="text-blue-500" /> Tiền nước
                                </span>
                                <span className="font-medium">{(invoice.waterFee || 0).toLocaleString('vi-VN')} ₫</span>
                            </div>
                            <p className="text-xs text-gray-400 ml-6 mt-0.5">
                                {invoice.waterUsage ?? 0} m³ × {(invoice.waterPrice || 0).toLocaleString('vi-VN')} ₫/m³
                            </p>
                        </div>

                        {/* Internet */}
                        {(invoice.internetFee > 0) && (
                            <>
                                <Divider />
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-700 flex items-center gap-2">
                                        <Wifi size={16} className="text-violet-500" /> Internet
                                    </span>
                                    <span className="font-medium">{invoice.internetFee.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </>
                        )}

                        {/* Dịch vụ */}
                        {(invoice.serviceFee > 0) && (
                            <>
                                <Divider />
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-700 flex items-center gap-2">
                                        <Settings size={16} className="text-gray-500" /> Dịch vụ
                                    </span>
                                    <span className="font-medium">{invoice.serviceFee.toLocaleString('vi-VN')} ₫</span>
                                </div>
                            </>
                        )}

                        {/* Giảm giá */}
                        {(invoice.discount > 0) && (
                            <>
                                <Divider />
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-green-600 flex items-center gap-2">
                                        🎁 Giảm giá
                                    </span>
                                    <span className="font-medium text-green-600">
                                        - {invoice.discount.toLocaleString('vi-VN')} ₫
                                    </span>
                                </div>
                            </>
                        )}
                    </section>

                    {/* Tổng cộng */}
                    <div className="bg-linear-to-r from-indigo-600 to-purple-700 rounded-2xl p-4 text-white flex justify-between items-center">
                        <span className="text-lg font-medium">Tổng cộng</span>
                        <span className="text-2xl font-bold">
                            {(invoice.totalAmount || 0).toLocaleString('vi-VN')} ₫
                        </span>
                    </div>

                    {/* Trạng thái thanh toán */}
                    {isPaid ? (
                        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-green-700">
                                <Check size={20} />
                                <p className="font-semibold">Đã thanh toán</p>
                            </div>
                            {invoice.paidAt && (
                                <p className="text-sm text-green-600 mt-1">
                                    Ngày {new Date(invoice.paidAt).toLocaleDateString('vi-VN')}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-center">
                            <p className="text-orange-700 font-semibold">⏳ Chưa thanh toán</p>
                            {invoice.dueDate && (
                                <p className="text-sm text-orange-500 mt-1">
                                    Hạn: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 3, gap: 1 }}>
                {/* <Button
                    onClick={onClose}
                    variant="outlined"
                    fullWidth
                    sx={{ borderRadius: '12px' }}
                >
                    Đóng
                </Button> */}
                <Button
                    onClick={handleShare}
                    variant="outlined"
                    startIcon={<Share2 size={16} />}
                    fullWidth
                    sx={{ borderRadius: '12px' }}
                >
                    Chia sẻ
                </Button>
                {!isPaid && onMarkPaid && (
                    <Button
                        onClick={() => { onClose(); onMarkPaid(invoice); }}
                        variant="contained"
                        startIcon={<Check size={16} />}
                        fullWidth
                        sx={{
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            },
                        }}
                    >
                        Thanh toán
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
