import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '../../modules/auth/services/AuthService';

const AuthContext = createContext(null);

/**
 * AuthProvider — Cung cấp trạng thái xác thực cho toàn bộ ứng dụng.
 *
 * Trách nhiệm:
 *   - Kiểm tra session hiện tại khi app khởi động
 *   - Lắng nghe thay đổi auth state từ Supabase
 *   - Xử lý logic "Ghi nhớ đăng nhập" (sessionOnly flag)
 *   - Cung cấp hàm logout() cho toàn app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const session = await AuthService.getCurrentSession();

        if (!isMounted) return;

        if (session) {
          // Kiểm tra "Ghi nhớ đăng nhập":
          // Nếu người dùng đăng nhập mà không chọn "Ghi nhớ", ta lưu flag vào sessionStorage.
          // sessionStorage bị xoá khi đóng tab/browser, localStorage thì không.
          // → Khi app khởi động lại (sessionStorage trống) mà localStorage vẫn có session
          //   và localStorage flag 'auth_was_session_only' = 'true' → cần force logout.
          const isSessionOnly = sessionStorage.getItem('auth_session_only') === 'true';
          const wasSessionOnly = localStorage.getItem('auth_was_session_only') === 'true';

          if (wasSessionOnly && !isSessionOnly) {
            // Browser đã được khởi động lại, người dùng không chọn "Ghi nhớ" → logout
            await AuthService.logout();
            localStorage.removeItem('auth_was_session_only');
            setUser(null);
          } else {
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // Lắng nghe thay đổi auth state từ Supabase (ví dụ: token refresh, đăng nhập từ tab khác)
    const { data: { subscription } } = AuthService.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        // Đồng bộ flag "session only" sang localStorage để check khi restart
        const isSessionOnly = sessionStorage.getItem('auth_session_only') === 'true';
        if (isSessionOnly) {
          localStorage.setItem('auth_was_session_only', 'true');
        } else {
          localStorage.removeItem('auth_was_session_only');
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('auth_was_session_only');
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'INITIAL_SESSION') {
        // Handled by initAuth above
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Đăng xuất: xoá session Supabase và toàn bộ auth flags.
   */
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
      localStorage.removeItem('auth_was_session_only');
    } catch (error) {
      console.error('[AuthContext] Lỗi khi đăng xuất:', error);
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — Hook để truy cập AuthContext.
 * Phải được dùng trong component con của AuthProvider.
 *
 * @returns {{ user: object|null, isAuthenticated: boolean, isLoading: boolean, logout: Function }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
};
