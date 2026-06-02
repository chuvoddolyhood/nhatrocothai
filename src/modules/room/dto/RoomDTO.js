export const INITIAL_ROOM_FORM_DATA = {
    propertyId: '',
    roomId: '',
    status: 'AVAILABLE',
    currentContractId: '',
    currentTenantNames: [],
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
