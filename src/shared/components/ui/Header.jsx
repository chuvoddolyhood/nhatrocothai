import React, { useState } from 'react';
import { IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu, Home, Building2, Users, FileSignature, DollarSign, BarChart3, Settings, LogOut } from 'lucide-react';

const Header = ({ data, onViewChange }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleNavigation = (view) => {
        if (onViewChange) {
            onViewChange(view);
        } else {
            console.log("Navigating to:", view);
        }
        setDrawerOpen(false);
    };

    const mainFunctions = [
        { id: 'dashboard', label: 'Bảng điều khiển', icon: <Home size={20} /> },
        { id: 'rooms', label: 'Quản lý phòng', icon: <Building2 size={20} /> },
        { id: 'tenants', label: 'Khách thuê', icon: <Users size={20} /> },
        { id: 'contracts', label: 'Hợp đồng', icon: <FileSignature size={20} /> },
        { id: 'billing', label: 'Hóa đơn', icon: <DollarSign size={20} /> },
        { id: 'reports', label: 'Báo cáo', icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className="mb-6 flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold mb-1 text-gray-800">{data.title}</h1>
                <p className="text-gray-600 text-sm">{data.description}</p>
            </div>

            <IconButton
                onClick={toggleDrawer(true)}
                className="bg-white shadow-sm"
                sx={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '12px',
                    '&:hover': { backgroundColor: '#f9fafb' }
                }}
            >
                <Menu size={24} className="text-gray-700" />
            </IconButton>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': { width: 280, borderRadius: '16px 0 0 16px' }
                }}
            >
                <div className="p-5 pb-2">
                    <h2 className="text-xl font-bold text-indigo-600 mb-1">NhaTroCoThai</h2>
                    <p className="text-sm text-gray-500">Menu chức năng</p>
                </div>

                <Divider sx={{ my: 1 }} />

                <List sx={{ px: 2 }}>
                    {mainFunctions.map((item) => (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.id)}
                                sx={{ borderRadius: '10px' }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: '#6366f1' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={<span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>

                <Divider sx={{ my: 1 }} />

                <List sx={{ px: 2 }}>
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton sx={{ borderRadius: '10px' }}>
                            <ListItemIcon sx={{ minWidth: 40, color: '#4b5563' }}>
                                <Settings size={20} />
                            </ListItemIcon>
                            <ListItemText
                                primary={<span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Cài đặt hệ thống</span>}
                            />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton sx={{ borderRadius: '10px' }}>
                            <ListItemIcon sx={{ minWidth: 40, color: '#ef4444' }}>
                                <LogOut size={20} />
                            </ListItemIcon>
                            <ListItemText
                                primary={<span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#ef4444' }}>Đăng xuất</span>}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
        </div>
    )
}

export default Header