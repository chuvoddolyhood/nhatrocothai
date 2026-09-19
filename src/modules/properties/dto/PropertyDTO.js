export const INITIAL_PROPERTY_FORM_DATA = {
    ownerId: '',
    name: '',
    address: '',
    roomCount: 0,
    occupiedRoomCount: 0,
    status: 'ACTIVE',
};

export const PROPERTY_STATUS = {
    ACTIVE: {
        value: 'ACTIVE',
        label: 'Đang hoạt động',
        color: 'success',
        bgGradient: 'from-green-500 to-emerald-600',
    },
    INACTIVE: {
        value: 'INACTIVE',
        label: 'Ngừng hoạt động',
        color: 'default',
        bgGradient: 'from-gray-400 to-gray-500',
    },
};
