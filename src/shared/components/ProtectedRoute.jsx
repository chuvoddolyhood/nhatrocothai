import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2 } from 'lucide-react';

/**
 * SplashScreen — Màn hình loading khi kiểm tra session ban đầu.
 * Hiển thị trong vài trăm milliseconds trước khi xác định đã đăng nhập hay chưa.
 */
const SplashScreen = () => (
  <div
    className="min-h-screen flex flex-col items-center justify-center gap-4"
    style={{
      background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #faf5ff 100%)',
    }}
  >
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '72px',
        height: '72px',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
        animation: 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
      }}
    >
      <Building2 size={36} color="white" />
    </div>
    <p style={{ color: '#6366f1', fontSize: '0.875rem', fontWeight: 500 }}>
      Đang tải...
    </p>

    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(0.96); }
      }
    `}</style>
  </div>
);

/**
 * ProtectedRoute — Bảo vệ route, chỉ cho phép truy cập khi đã đăng nhập.
 *
 * Trạng thái:
 *   - Đang kiểm tra session   → hiển thị SplashScreen
 *   - Chưa đăng nhập          → redirect về /login
 *   - Đã đăng nhập            → render children
 *
 * @param {{ children: React.ReactNode }} props
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
