import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, Divider } from '@mui/material';
import { Home, DollarSign, Activity, Maximize, FileSignature, X, Layers } from 'lucide-react';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { ROOM_STATUS } from '../dto/RoomDTO';

const gradients = [
    'from-emerald-400 to-teal-500',
    'from-cyan-400 to-blue-500',
    'from-violet-400 to-fuchsia-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-red-500',
];

export function RoomDetailDialog({ open, onClose, room, onEdit, gradientIndex = 0 }) {
    if (!room) return null;

    const formatCurrency = (value) => value != null ? `${Number(value).toLocaleString('vi-VN')} ₫` : '---';

    const statusConfig = ROOM_STATUS[room.status] || { label: room.status, bgGradient: 'from-gray-400 to-gray-500' };
    const gradient = statusConfig.bgGradient || gradients[gradientIndex % gradients.length];

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle sx={{ p: 0 }}>
                {/* Header banner */}
                <div className={`bg-gradient-to-r ${gradient} p-5 text-white`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center">
                                <Home size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-white/80 font-normal">Chi tiết phòng</p>
                                <h2 className="text-xl font-semibold">Phòng {room.roomId}</h2>
                                <Chip
                                    label={statusConfig.label}
                                    size="small"
                                    sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
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
                    {/* Thông tin cơ bản */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Thông tin cơ bản
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoItem
                                icon={<Home size={18} className="text-teal-600" />}
                                label="Số phòng"
                                value={room.roomId}
                            />
                            <InfoItem
                                icon={<Layers size={18} className="text-blue-600" />}
                                label="Tầng"
                                value={room.floor || '---'}
                            />
                            <InfoItem
                                icon={<Maximize size={18} className="text-emerald-600" />}
                                label="Diện tích"
                                value={room.area != null ? `${room.area} m²` : '---'}
                            />
                            <InfoItem
                                icon={<Activity size={18} className="text-orange-600" />}
                                label="Trạng thái"
                                value={statusConfig.label}
                            />
                        </div>
                    </section>

                    <Divider />

                    {/* Giá thuê */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Tài chính
                        </p>
                        <div className="flex flex-col gap-3">
                            <InfoItem
                                icon={<DollarSign size={18} className="text-blue-600" />}
                                label="Giá thuê mặc định"
                                value={formatCurrency(room.currentPrice)}
                            />
                        </div>
                    </section>
                </div>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} fullWidth variant="outlined">
                    Đóng
                </Button>
                {onEdit && room.status !== 'OCCUPIED' && (
                    <Button
                        onClick={() => { onClose(); onEdit(room); }}
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
