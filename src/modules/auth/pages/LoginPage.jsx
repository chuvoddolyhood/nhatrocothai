import React from 'react';
import { Card, CardContent } from '@mui/material';
import { Building2 } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

/**
 * LoginPage — Trang đăng nhập full-screen.
 *
 * Trách nhiệm:
 *   - Render layout toàn trang (background, card, branding)
 *   - Kết nối useLogin hook với LoginForm component
 *
 * Không chứa business logic hay API calls trực tiếp.
 */
const LoginPage = () => {
  const loginProps = useLogin();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #faf5ff 100%)',
      }}
    >
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-10%',
          right: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '-10%',
          left: '-10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <Card
        sx={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(99, 102, 241, 0.12), 0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* ── Header branding ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '16px 20px 16px',
            textAlign: 'center',
          }}
        >
          {/* Logo icon */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              marginBottom: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Building2 size={20} color="white" />
          </div>

          <h1
            style={{
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Nhà Trọ Cô Thái
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.75rem',
              margin: '2px 0 0',
              fontWeight: 400,
            }}
          >
            Quản lý nhà trọ dễ dàng
          </p>
        </div>

        {/* ── Form section ── */}
        <CardContent sx={{ p: '16px 20px 20px' }}>
          <h2
            style={{
              color: '#1e1b4b',
              fontSize: '0.9375rem',
              fontWeight: 600,
              margin: '0 0 12px',
              textAlign: 'center',
            }}
          >
            Chào mừng trở lại 👋
          </h2>

          <LoginForm {...loginProps} />
        </CardContent>
      </Card>

      {/* Footer */}
      <p
        style={{
          marginTop: '16px',
          textAlign: 'center',
          color: '#9ca3af',
          fontSize: '0.75rem',
          zIndex: 1,
        }}
      >
        © {new Date().getFullYear()} Nhà Trọ Cô Thái. Dành riêng cho Chủ trọ.
      </p>
    </div>
  );
};

export default LoginPage;
