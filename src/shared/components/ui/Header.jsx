import React, { useState, useEffect } from 'react';
import { IconButton, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu, Home, Building2, Users, FileSignature, DollarSign, BarChart3, Settings, LogOut } from 'lucide-react';
import { menuConfig } from '../common/MenuConfig';

const Header = ({ data, onViewChange }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Set scrolled status for glassmorphic visual enhancement
            setIsScrolled(currentScrollY > 10);

            // Hide header on scroll down, show on scroll up (with threshold of 80px)
            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            }

            // Always ensure header is visible near the top of the page
            if (currentScrollY <= 10) {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

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

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-40 px-4 py-4 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
                } ${isScrolled
                    ? 'bg-white/85 backdrop-blur-md border-b border-indigo-100/50 shadow-sm'
                    : 'bg-transparent border-b border-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold mb-1 text-gray-800">
                        {data?.title || "NhaTroCoThai"}
                    </h1>
                    {data?.description && (
                        <p className="text-gray-600 text-sm">{data.description}</p>
                    )}
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
            </div>

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
                    {menuConfig.map(({ id, label, icon: Icon }) => (
                        <ListItem key={id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(id)}
                                sx={{ borderRadius: '10px' }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: '#6366f1' }}>
                                    <Icon size={20} />
                                </ListItemIcon>

                                <ListItemText
                                    primary={
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                            {label}
                                        </span>
                                    }
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
        </header>
    )
}

export default Header