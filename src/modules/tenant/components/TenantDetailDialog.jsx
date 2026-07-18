import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Divider, Chip, Collapse,
} from '@mui/material';
import {
    User, Phone, CreditCard, Calendar, MapPin, X,
    BadgeCheck, Home, History, Image, ChevronDown,
} from 'lucide-react';
import InfoItem from '../../../shared/components/ui/InfoItem';
import { TenantStatus, TenantStatusLabel } from '../constants/TenantStatus';
import { CccdImage } from './CccdImage';
import { ContractCard } from './ContractCard';

const gradients = [
    'from-purple-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-orange-400 to-red-500',
    'from-indigo-400 to-purple-500',
];

export function TenantDetailDialog({ open, onClose, tenant, onEdit, gradientIndex = 0, contracts = [], rooms = [] }) {
    const [showPastRooms, setShowPastRooms] = useState(false);
    const pastRoomsRef = useRef(null);

    const handleTogglePastRooms = () => {
        const willShow = !showPastRooms;
        setShowPastRooms(willShow);
        if (willShow) {
            setTimeout(() => {
                if (pastRoomsRef.current) {
                    pastRoomsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 150); // Đợi xíu để Collapse mở ra
        }
    };

    // Reset state khi dialog đóng/mở
    useEffect(() => {
        if (!open) {
            setShowPastRooms(false);
        }
    }, [open]);

    if (!tenant) return null;

    const gradient = gradients[gradientIndex % gradients.length];
    const isMovedOut = tenant.status === TenantStatus.MOVED_OUT;

    const tenantContracts = contracts.filter(c =>
        c.representativeTenantId === tenant.id ||
        (c.tenantIds && c.tenantIds.includes(tenant.id))
    );

    const activeContracts = tenantContracts.filter(c => c.status === 'ACTIVE');
    const pastContracts = tenantContracts.filter(c => c.status !== 'ACTIVE');

    const currentRooms = activeContracts.map(c => {
        const room = rooms.find(r => r.id === c.roomId);
        return { contract: c, room };
    }).filter(x => x.room);

    const pastRooms = pastContracts.map(c => {
        const room = rooms.find(r => r.id === c.roomId);
        return { contract: c, room };
    }).filter(x => x.room);

    const hasCccdImages = tenant.citizenIdFrontUrl || tenant.citizenIdBackUrl;

    return (
        <Dialog open={open} onClose={onClose} fullScreen>
            <DialogTitle sx={{ p: 0 }}>
                <div className={`bg-gradient-to-r ${isMovedOut ? 'from-gray-500 to-gray-600' : gradient} p-5 text-white`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-white/25 rounded-2xl flex items-center justify-center">
                                <User size={28} />
                            </div>
                            <div>
                                <p className="text-sm text-white/80 font-normal">Chi tiết khách thuê</p>
                                <h2 className="text-xl font-semibold">{tenant.fullName}</h2>
                                {tenant.status && (
                                    <Chip
                                        label={TenantStatusLabel[tenant.status] || tenant.status}
                                        size="small"
                                        sx={{ mt: 0.5, fontWeight: 600, fontSize: '0.7rem', bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                                    />
                                )}
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

                    {/* Thông tin liên lạc */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Liên lạc
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <InfoItem
                                icon={<BadgeCheck size={18} className="text-teal-600" />}
                                label="Họ và tên"
                                value={tenant.fullName}
                            />
                            <InfoItem
                                icon={<Phone size={18} className="text-indigo-600" />}
                                label="Số điện thoại"
                                value={tenant.phone || '---'}
                            />
                        </div>
                    </section>

                    <Divider />

                    {/* Thông tin cá nhân */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Cá nhân
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <InfoItem
                                    icon={<CreditCard size={18} className="text-purple-600" />}
                                    label="CCCD/CMND"
                                    value={tenant.citizenId || '---'}
                                />
                                <InfoItem
                                    icon={<Calendar size={18} className="text-green-600" />}
                                    label="Ngày sinh"
                                    value={tenant.birthDate ? new Date(tenant.birthDate).toLocaleDateString('vi-VN') : '---'}
                                />
                            </div>
                            <InfoItem
                                icon={<MapPin size={18} className="text-red-600" />}
                                label="Địa chỉ thường trú"
                                value={tenant.permanentAddress || '---'}
                            />
                        </div>
                    </section>

                    {/* Ảnh CCCD */}
                    {hasCccdImages && (
                        <>
                            <Divider />
                            <section>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <Image size={14} />
                                    Ảnh CCCD/CMND
                                </p>
                                <div className="flex flex-col gap-3">
                                    <CccdImage url={tenant.citizenIdFrontUrl} label="Mặt trước" />
                                    <CccdImage url={tenant.citizenIdBackUrl} label="Mặt sau" />
                                </div>
                            </section>
                        </>
                    )}

                    {/* Phòng đang ở */}
                    {currentRooms.length > 0 && (
                        <>
                            <Divider />
                            <section>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <Home size={14} />
                                    Phòng đang ở
                                </p>
                                <div className="flex flex-col gap-2">
                                    {currentRooms.map(({ contract, room }) => (
                                        <ContractCard
                                            key={contract.id}
                                            contract={contract}
                                            room={room}
                                            isActive={true}
                                        />
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    {/* Lịch sử phòng từng ở */}
                    {pastRooms.length > 0 && (
                        <>
                            <Divider />
                            <section ref={pastRoomsRef}>
                                <button
                                    onClick={handleTogglePastRooms}
                                    className="w-full flex items-center justify-between py-2 text-left"
                                >
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 m-0">
                                        <History size={14} />
                                        Lịch sử phòng từng ở ({pastRooms.length})
                                    </p>
                                    <div className="text-gray-400">
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-300 ${showPastRooms ? '-rotate-180' : ''}`}
                                        />
                                    </div>
                                </button>

                                <Collapse in={showPastRooms}>
                                    <div className="flex flex-col gap-2 mt-3 mb-1">
                                        {pastRooms.map(({ contract, room }) => (
                                            <ContractCard
                                                key={contract.id}
                                                contract={contract}
                                                room={room}
                                                isActive={false}
                                            />
                                        ))}
                                    </div>
                                </Collapse>
                            </section>
                        </>
                    )}

                </div>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} fullWidth variant="outlined">
                    Đóng
                </Button>
                {onEdit && !isMovedOut && (
                    <Button
                        onClick={() => { onClose(); onEdit(tenant); }}
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
