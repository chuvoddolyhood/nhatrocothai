import { BarChart3, Building2, DollarSign, FileSignature, Home, Users } from "lucide-react";

export const menuConfig = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: Home },
    { id: 'rooms', label: 'Quản lý phòng', icon: Building2 },
    { id: 'tenants', label: 'Khách thuê', icon: Users },
    { id: 'contracts', label: 'Hợp đồng', icon: FileSignature },
    { id: 'billing', label: 'Hóa đơn', icon: DollarSign },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
];

export const getMenuLabel = (menuId) => {
    return menuConfig.find(item => item.id === menuId)?.label || "";
};