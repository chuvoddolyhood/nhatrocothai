import { TenantStatus, TenantStatusLabel } from "../constants/TenantStatus";

export const INITIAL_TENANT_FORM_DATA = {
    fullName: '',
    phone: '',
    citizenId: '',
    birthDate: '',
    permanentAddress: '',
    citizenIdFrontUrl: '',
    citizenIdBackUrl: '',
};

export const STATUS_FILTERS = [
    {
        value: TenantStatus.ACTIVE,
        label: TenantStatusLabel.ACTIVE,
        bg: '#10b981',
        shadow: 'rgba(16,185,129,0.40)',
    },
    {
        value: TenantStatus.MOVED_OUT,
        label: TenantStatusLabel.MOVED_OUT,
        bg: '#6b7280',
        shadow: 'rgba(107,114,128,0.40)',
    },
    {
        value: TenantStatus.BLOCKED,
        label: TenantStatusLabel.BLOCKED,
        bg: '#f59e0b',
        shadow: 'rgba(245,158,11,0.40)',
    },
];