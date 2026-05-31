import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, Building2, Users, DollarSign, BarChart3 } from 'lucide-react';

export function MobileNavigation({ currentView, onViewChange }) {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: Home },
    { id: 'rooms', label: 'Phòng', icon: Building2 },
    { id: 'tenants', label: 'Khách', icon: Users },
    { id: 'billing', label: 'Hóa đơn', icon: DollarSign },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3 },
  ];

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderTop: '1px solid #e2e8f0',
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentView}
        onChange={(event, newValue) => {
          onViewChange(newValue);
        }}
        showLabels
        sx={{
          height: '70px',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '8px 12px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            marginTop: '4px',
          },
          '& .Mui-selected': {
            color: '#6366f1',
          },
        }}
      >
        {menuItems.map((item) => (
          <BottomNavigationAction
            key={item.id}
            label={item.label}
            value={item.id}
            icon={<item.icon size={22} />}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
