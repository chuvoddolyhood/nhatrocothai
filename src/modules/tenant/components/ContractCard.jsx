import { useState } from 'react';
import { Button, Chip } from '@mui/material';
import { Home, FileText, Calendar, Receipt, ChevronDown } from 'lucide-react';
import { ContractInvoicesDialog } from './ContractInvoicesDialog';

function formatDate(dateStr) {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

export function ContractCard({ contract, room, isActive }) {
    const [invoiceSheetOpen, setInvoiceSheetOpen] = useState(false);

    const statusLabel = isActive
        ? 'Đang ở'
        : contract.status === 'TERMINATED'
            ? 'Đã chấm dứt'
            : contract.status === 'EXPIRED'
                ? 'Hết hạn'
                : contract.status;

    const borderClass = isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50';
    const chipSx = isActive
        ? { bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.65rem', height: '20px' }
        : { bgcolor: '#f3f4f6', color: '#6b7280', fontWeight: 600, fontSize: '0.65rem', height: '20px' };

    return (
        <>
            <div className={`p-3 rounded-xl border ${borderClass} flex flex-col gap-1.5`}>
                <div className="flex items-center justify-between">
                    <span className={`font-semibold text-sm flex items-center gap-1 ${isActive ? 'text-green-800' : 'text-gray-700'}`}>
                        <Home size={14} />
                        Phòng {room.roomId || room.roomCode}
                    </span>
                    <Chip label={statusLabel} size="small" sx={chipSx} />
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText size={12} />
                    <span>Mã HĐ: <span className="font-medium text-gray-700">#{contract.id}</span></span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>
                        {formatDate(contract.startDate)}
                        {isActive
                            ? (contract.endDate ? ` → ${formatDate(contract.endDate)}` : ' → Hiện tại')
                            : (contract.endDate ? ` → ${formatDate(contract.endDate)}` : '')}
                    </span>
                </div>

                {/* Xem hóa đơn button */}
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Receipt size={13} />}
                    endIcon={<ChevronDown size={13} />}
                    onClick={() => setInvoiceSheetOpen(true)}
                    fullWidth
                    sx={{
                        mt: 0.5,
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        borderColor: isActive ? '#86efac' : '#d1d5db',
                        color: isActive ? '#15803d' : '#4b5563',
                        '&:hover': {
                            borderColor: isActive ? '#4ade80' : '#9ca3af',
                            bgcolor: isActive ? '#f0fdf4' : '#f9fafb',
                        },
                    }}
                >
                    Xem hóa đơn
                </Button>
            </div>

            <ContractInvoicesDialog
                open={invoiceSheetOpen}
                onClose={() => setInvoiceSheetOpen(false)}
                contractId={contract.id}
                roomCode={room.roomId || room.roomCode}
            />
        </>
    );
}
