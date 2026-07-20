export const INITIAL_ROOM_FORM_DATA = {
    propertyId: '',
    roomId: '',
    status: 'AVAILABLE',
    currentContractId: '',
    currentPrice: '',
    floor: '',
    area: '',
    createdAt: '',
    createdBy: '',
    updatedAt: '',
    updatedBy: '',
};

export const ROOM_STATUS = {
    AVAILABLE: {
        label: 'Trống',
        color: 'success',
        bgGradient: 'from-green-400 to-emerald-500',
    },
    OCCUPIED: {
        label: 'Đang ở',
        color: 'primary',
        bgGradient: 'from-indigo-400 to-purple-500',
    },
    MAINTENANCE: {
        label: 'Sửa chữa',
        color: 'warning',
        bgGradient: 'from-orange-400 to-amber-500',
    },
    ARCHIVED: {
        label: 'Đã xóa',
        color: 'default',
        bgGradient: 'from-gray-400 to-gray-500',
    },
};

export const STATUS_FILTERS = [
    {
        value: 'ALL',
        label: 'Tất cả',
        bg: '#6366f1',
        shadow: 'rgba(99,102,241,0.40)',
    },
    {
        value: 'OCCUPIED',
        label: 'Đang thuê',
        bg: '#10b981',
        shadow: 'rgba(16,185,129,0.40)',
    },
    {
        value: 'AVAILABLE',
        label: 'Phòng trống',
        bg: '#f59e0b',
        shadow: 'rgba(245,158,11,0.40)',
    },

];
