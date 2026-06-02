import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { MobileNavigation } from './shared/components/MobileNavigation';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { RoomListPage } from './modules/room/pages/RoomListPage';
import { TenantListPage } from './modules/tenant/pages/TenantListPage';
import { InvoiceListPage } from './modules/invoice/pages/InvoiceListPage';
import { ReportingDashboard } from './modules/dashboard/components/ReportingDashboard';
import { RoomService } from './modules/room/services/RoomService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#8b5cf6',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  // const [tenants, setTenants] = useState([
  //   { id: '1', name: 'Nguyễn Văn A', phone: '0901234567', idCard: '079123456789', moveInDate: '2024-01-15', roomNumber: '101', roomId: '1' },
  //   { id: '2', name: 'Trần Thị B', phone: '0902345678', idCard: '079234567890', moveInDate: '2024-02-01', roomNumber: '102', roomId: '2' },
  //   { id: '3', name: 'Lê Văn C', phone: '0903456789', idCard: '079345678901', moveInDate: '2024-03-10', roomNumber: '201', roomId: '4' },
  //   { id: '4', name: 'Phạm Thị D', phone: '0904567890', idCard: '079456789012', moveInDate: '2024-02-15', roomNumber: '202', roomId: '5' },
  //   { id: '5', name: 'Hoàng Văn E', phone: '0905678901', idCard: '079567890123', moveInDate: '2024-04-01', roomNumber: '301', roomId: '7' },
  // ]);

  // const [bills, setBills] = useState([
  //   {
  //     id: '1',
  //     roomId: '1',
  //     roomNumber: '101',
  //     tenantName: 'Nguyễn Văn A',
  //     month: '2026-05',
  //     roomPrice: 2500000,
  //     electricPrevious: 150,
  //     electricCurrent: 180,
  //     electricPrice: 3500,
  //     waterPrevious: 20,
  //     waterCurrent: 25,
  //     waterPrice: 15000,
  //     otherServices: [{ name: 'Internet', price: 100000 }],
  //     total: 2780000,
  //     paid: true,
  //     paidDate: '2026-05-05',
  //   },
  //   {
  //     id: '2',
  //     roomId: '2',
  //     roomNumber: '102',
  //     tenantName: 'Trần Thị B',
  //     month: '2026-05',
  //     roomPrice: 2500000,
  //     electricPrevious: 140,
  //     electricCurrent: 165,
  //     electricPrice: 3500,
  //     waterPrevious: 18,
  //     waterCurrent: 22,
  //     waterPrice: 15000,
  //     otherServices: [{ name: 'Internet', price: 100000 }],
  //     total: 2747500,
  //     paid: false,
  //   },
  //   {
  //     id: '3',
  //     roomId: '4',
  //     roomNumber: '201',
  //     tenantName: 'Lê Văn C',
  //     month: '2026-05',
  //     roomPrice: 2500000,
  //     electricPrevious: 160,
  //     electricCurrent: 190,
  //     electricPrice: 3500,
  //     waterPrevious: 22,
  //     waterCurrent: 27,
  //     waterPrice: 15000,
  //     otherServices: [{ name: 'Internet', price: 100000 }],
  //     total: 2780000,
  //     paid: true,
  //     paidDate: '2026-05-03',
  //   },
  //   {
  //     id: '4',
  //     roomId: '5',
  //     roomNumber: '202',
  //     tenantName: 'Phạm Thị D',
  //     month: '2026-05',
  //     roomPrice: 2500000,
  //     electricPrevious: 135,
  //     electricCurrent: 155,
  //     electricPrice: 3500,
  //     waterPrevious: 19,
  //     waterCurrent: 23,
  //     waterPrice: 15000,
  //     otherServices: [{ name: 'Internet', price: 100000 }],
  //     total: 2730000,
  //     paid: false,
  //   },
  //   {
  //     id: '5',
  //     roomId: '7',
  //     roomNumber: '301',
  //     tenantName: 'Hoàng Văn E',
  //     month: '2026-05',
  //     roomPrice: 2500000,
  //     electricPrevious: 145,
  //     electricCurrent: 170,
  //     electricPrice: 3500,
  //     waterPrevious: 21,
  //     waterCurrent: 26,
  //     waterPrice: 15000,
  //     otherServices: [{ name: 'Internet', price: 100000 }],
  //     total: 2762500,
  //     paid: true,
  //     paidDate: '2026-05-01',
  //   },
  // ]);

  // const handleAddTenant = (tenant) => {
  //   const newTenant = { ...tenant, id: Date.now().toString() };
  //   setTenants([...tenants, newTenant]);

  //   setRooms(rooms.map(room =>
  //     room.id === tenant.roomId ? { ...room, status: 'occupied' } : room
  //   ));
  // };

  // const handleUpdateTenant = (id, updates) => {
  //   setTenants(tenants.map(tenant => tenant.id === id ? { ...tenant, ...updates } : tenant));
  // };

  // const handleDeleteTenant = (id) => {
  //   const tenant = tenants.find(t => t.id === id);
  //   setTenants(tenants.filter(t => t.id !== id));

  //   if (tenant) {
  //     setRooms(rooms.map(room =>
  //       room.id === tenant.roomId ? { ...room, status: 'empty' } : room
  //     ));
  //   }
  // };

  // const handleCreateBill = (bill) => {
  //   const electricTotal = (bill.electricCurrent - bill.electricPrevious) * bill.electricPrice;
  //   const waterTotal = (bill.waterCurrent - bill.waterPrevious) * bill.waterPrice;
  //   const servicesTotal = bill.otherServices.reduce((sum, s) => sum + s.price, 0);
  //   const total = bill.roomPrice + electricTotal + waterTotal + servicesTotal;

  //   const newBill = {
  //     ...bill,
  //     id: Date.now().toString(),
  //     total,
  //   };

  //   setBills([...bills, newBill]);
  // };

  // const handleMarkPaid = (id, paidDate) => {
  //   setBills(bills.map(bill =>
  //     bill.id === id ? { ...bill, paid: true, paidDate } : bill
  //   ));
  // };

  // // const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  // const currentMonth = new Date().toISOString().slice(0, 7);
  // const currentMonthBills = bills.filter(b => b.month === currentMonth);
  // const paidBills = currentMonthBills.filter(b => b.paid).length;
  // const unpaidBills = currentMonthBills.filter(b => !b.paid).length;
  // const expectedRevenue = currentMonthBills.reduce((sum, b) => sum + b.total, 0);
  // const actualRevenue = currentMonthBills.filter(b => b.paid).reduce((sum, b) => sum + b.total, 0);

  // const stats = {
  //   totalRooms: rooms.length,
  //   occupiedRooms,
  //   emptyRooms: rooms.filter(r => r.status === 'empty').length,
  //   paidThisMonth: paidBills,
  //   unpaidThisMonth: unpaidBills,
  //   expectedRevenue,
  //   actualRevenue,
  // };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* {currentView === 'dashboard' && <DashboardPage stats={stats} />} */}
        {currentView === 'rooms' && <RoomListPage />}
        {/* {currentView === 'tenants' && (
          <TenantListPage
            tenants={tenants}
            availableRooms={rooms.filter(r => r.status === 'empty').map(r => ({ id: r.id, number: r.number }))}
            onAddTenant={handleAddTenant}
            onUpdateTenant={handleUpdateTenant}
            onDeleteTenant={handleDeleteTenant}
          />
        )}
        {currentView === 'billing' && (
          <InvoiceListPage
            bills={bills}
            rooms={rooms.map(r => ({ id: r.id, number: r.number, price: r.price }))}
            tenants={tenants}
            onCreateBill={handleCreateBill}
            onMarkPaid={handleMarkPaid}
          />
        )}
        {currentView === 'reports' && (
          <ReportingDashboard
            bills={bills}
            rooms={rooms}
          />
        )} */}

        <MobileNavigation
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view)}
        />
      </div>
    </ThemeProvider>
  );
}
