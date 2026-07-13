import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Divider } from '@mui/material';
import {
    FileSignature, DollarSign, Calendar, Users, Building2,
    Home, CalendarCheck, CalendarX, Receipt, BadgeCheck, X
} from 'lucide-react';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { ContractStatus, ContractStatusLabel } from '../constants/ContractStatus';

const statusConfig = {
    [ContractStatus.ACTIVE]: { label: ContractStatusLabel.ACTIVE, color: 'success' },
    [ContractStatus.EXPIRED]: { label: ContractStatusLabel.EXPIRED, color: 'warning' },
    [ContractStatus.TERMINATED]: { label: ContractStatusLabel.TERMINATED, color: 'error' },
};

const gradients = [
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-fuchsia-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-500',
];

function formatDate(date) {
    if (!date) return '---';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN');
}

export function ContractDetailDialog({ open, onClose, contract, rooms, tenants, onEdit, gradientIndex = 0 }) {
    if (!contract) return null;

    const room = rooms?.find(r => r.id === contract.roomId);
    const roomName = room ? room.roomId : (contract.roomId || '---');

    const repTenant = tenants?.find(t => t.id === contract.representativeTenantId);
    const repTenantName = repTenant
        ? `${repTenant.fullName}${repTenant.phone ? ' — ' + repTenant.phone : ''}`
        : (contract.representativeTenantId || '---');

    const otherTenants = (contract.tenantIds || []).map(id => {
        const t = tenants?.find(t => t.id === id);
        return t ? t.fullName : id;
    });

    const gradient = gradients[gradientIndex % gradients.length];
    const status = statusConfig[contract.status] || { label: contract.status, color: 'default' };

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle sx={{ p: 0 }}>
                {/* Header banner */}
                <div className={`bg-gradient-to-r ${gradient} p-5 text-white`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center">
                                <FileSignature size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-white/80 font-normal">Chi tiết hợp đồng</p>
                                <h2 className="text-xl font-semibold">Phòng {roomName}</h2>
                                <Chip
                                    label={status.label}
                                    size="small"
                                    color={status.color}
                                    sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.7rem' }}
                                />
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
                <div className="p-4 flex flex-col gap-5">

                    {/* Thông tin phòng & khu trọ */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Thông tin phòng
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoItem
                                icon={<Home size={18} className="text-teal-600" />}
                                label="Phòng"
                                value={roomName}
                            />
                            <InfoItem
                                icon={<Building2 size={18} className="text-blue-600" />}
                                label="Trạng thái hợp đồng"
                                value={status.label}
                            />
                        </div>
                    </section>

                    <Divider />

                    {/* Thông tin tài chính */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Tài chính
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoItem
                                icon={<DollarSign size={18} className="text-blue-600" />}
                                label="Giá thuê / tháng"
                                value={contract.monthlyRent != null ? `${Number(contract.monthlyRent).toLocaleString('vi-VN')}đ` : '---'}
                            />
                            <InfoItem
                                icon={<DollarSign size={18} className="text-emerald-600" />}
                                label="Tiền đặt cọc"
                                value={contract.depositAmount != null ? `${Number(contract.depositAmount).toLocaleString('vi-VN')}đ` : '---'}
                            />
                            <InfoItem
                                icon={<Receipt size={18} className="text-orange-600" />}
                                label="Ngày ghi hóa đơn"
                                value={contract.billingDay ? `Ngày ${contract.billingDay} hàng tháng` : '---'}
                                className="col-span-2"
                            />
                        </div>
                    </section>

                    <Divider />

                    {/* Thời hạn hợp đồng */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Thời hạn
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoItem
                                icon={<CalendarCheck size={18} className="text-indigo-600" />}
                                label="Ngày bắt đầu"
                                value={formatDate(contract.startDate)}
                            />
                            <InfoItem
                                icon={<CalendarX size={18} className="text-rose-500" />}
                                label="Ngày kết thúc"
                                value={contract.endDate ? formatDate(contract.endDate) : 'Không xác định'}
                            />
                        </div>
                    </section>

                    <Divider />

                    {/* Khách thuê */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Khách thuê
                        </p>
                        <div className="flex flex-col gap-3">
                            <InfoItem
                                icon={<BadgeCheck size={18} className="text-violet-600" />}
                                label="Người đại diện"
                                value={repTenantName}
                            />
                            {otherTenants.length > 0 && (
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Users size={18} className="text-slate-500" />
                                        <p className="text-xs text-gray-600">Thành viên khác</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pl-8">
                                        {otherTenants.map((name, i) => (
                                            <Chip key={i} label={name} size="small" variant="outlined" />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {otherTenants.length === 0 && (
                                <InfoItem
                                    icon={<Users size={18} className="text-slate-400" />}
                                    label="Thành viên khác"
                                    value="Không có"
                                />
                            )}
                        </div>
                    </section>
                </div>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} fullWidth variant="outlined">
                    Đóng
                </Button>
                {onEdit && (
                    <Button
                        onClick={() => { onClose(); onEdit(contract); }}
                        fullWidth
                        variant="contained"
                        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    >
                        Chỉnh sửa
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
