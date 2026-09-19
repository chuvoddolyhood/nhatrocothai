import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { MobileNavigation } from './shared/components/MobileNavigation';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { RoomListPage } from './modules/room/pages/RoomListPage';
import { TenantListPage } from './modules/tenant/pages/TenantListPage';
import { InvoiceListPage } from './modules/invoice/pages/InvoiceListPage';
import { PropertyListPage } from './modules/properties/pages/PropertyListPage';
import { ContractListPage } from './modules/contract/pages/ContractListPage';
import { ReportingPage } from './modules/dashboard/pages/ReportingPage';
import Header from './shared/components/ui/Header';
import LoginPage from './modules/auth/pages/LoginPage';
import { ProtectedRoute } from './shared/components/ProtectedRoute';

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

function RoomListPageWrapper({ setHeaderConfig }) {
  const location = useLocation();
  const statusFilter = location.state?.statusFilter;
  return <RoomListPage key={statusFilter || 'default'} view="rooms" setHeaderConfig={setHeaderConfig} initialStatusFilter={statusFilter} />;
}

function TenantListPageWrapper({ setHeaderConfig }) {
  const location = useLocation();
  const statusFilter = location.state?.statusFilter;
  return <TenantListPage key={statusFilter || 'default'} setHeaderConfig={setHeaderConfig} initialStatusFilter={statusFilter} />;
}

/**
 * MainLayout — Layout chính sau khi đăng nhập.
 * Đã chuyển sang sử dụng React Router cho điều hướng nội bộ.
 */
function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [headerConfig, setHeaderConfig] = useState(null);

  const getPathForView = (view) => {
    if (view === 'dashboard') return '/';
    return `/${view}`;
  };

  const getViewFromPath = (path) => {
    if (path === '/') return 'dashboard';
    return path.replace('/', '');
  };

  const currentView = getViewFromPath(location.pathname);

  const handleViewChange = (view) => {
    if (view !== currentView) {
      navigate(getPathForView(view));
      setHeaderConfig(null);
    }
  };

  const navigateTo = (view, options = {}) => {
    navigate(getPathForView(view), { state: options });
    setHeaderConfig(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-indigo-50 via-white to-purple-50 pt-24">
      <Header
        data={headerConfig || {}}
        onViewChange={handleViewChange}
      />

      <Routes>
        <Route path="/" element={<DashboardPage setHeaderConfig={setHeaderConfig} onNavigate={navigateTo} />} />
        <Route path="/properties" element={<PropertyListPage view="properties" setHeaderConfig={setHeaderConfig} />} />
        <Route path="/rooms" element={<RoomListPageWrapper setHeaderConfig={setHeaderConfig} />} />
        <Route path="/tenants" element={<TenantListPageWrapper setHeaderConfig={setHeaderConfig} />} />
        <Route path="/contracts" element={<ContractListPage view="contracts" setHeaderConfig={setHeaderConfig} />} />
        <Route path="/billing" element={<InvoiceListPage view="billing" setHeaderConfig={setHeaderConfig} />} />
        <Route path="/reports" element={<ReportingPage view="reports" setHeaderConfig={setHeaderConfig} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <MobileNavigation
        currentView={currentView}
        onViewChange={handleViewChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Route công khai: Đăng nhập */}
        <Route path="/login" element={<LoginPage />} />

        {/* Route được bảo vệ: toàn bộ ứng dụng chính */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />

        {/* Fallback: redirect về trang chính */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
