import { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { MobileNavigation } from './shared/components/MobileNavigation';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { RoomListPage } from './modules/room/pages/RoomListPage';
import { TenantListPage } from './modules/tenant/pages/TenantListPage';
import { InvoiceListPage } from './modules/invoice/pages/InvoiceListPage';
import { RoomService } from './modules/room/services/RoomService';
import { ContractListPage } from './modules/contract/pages/ContractListPage';
import { ReportingPage } from './modules/dashboard/pages/ReportingPage';
import Header from './shared/components/ui/Header';

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
  const [headerConfig, setHeaderConfig] = useState(null);

  const handleViewChange = (view) => {
    setCurrentView(view);
    setHeaderConfig(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage setHeaderConfig={setHeaderConfig} />;

      case 'rooms':
        return <RoomListPage view={currentView} setHeaderConfig={setHeaderConfig} />;

      case 'tenants':
        return <TenantListPage setHeaderConfig={setHeaderConfig} />;

      case 'contracts':
        return <ContractListPage view={currentView} setHeaderConfig={setHeaderConfig} />;

      case 'billing':
        return <InvoiceListPage view={currentView} setHeaderConfig={setHeaderConfig} />;

      case 'reports':
        return <ReportingPage view={currentView} setHeaderConfig={setHeaderConfig} />;

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen bg-linear-to-r from-indigo-50 via-white to-purple-50 pt-24">
        <Header
          data={headerConfig || {}}
          onViewChange={handleViewChange}
        />

        {renderContent()}

        <MobileNavigation
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      </div>
    </ThemeProvider>
  );
}
