import { supabase } from '../../../supabase/config';
import { AUTH_ERROR_MESSAGES } from '../constants/AuthErrorMessages';
import { phoneToEmail } from '../utils/phoneValidator';

// Flag lưu trong sessionStorage để phân biệt "session only" login
const SESSION_ONLY_KEY = 'auth_session_only';

/**
 * Ánh xạ lỗi từ Supabase Auth sang thông báo tiếng Việt thân thiện.
 * @param {Error} error
 * @returns {string}
 */
const mapAuthError = (error) => {
  if (!error) return AUTH_ERROR_MESSAGES.UNKNOWN;

  const message = (error.message || '').toLowerCase();
  const status = error.status;

  // Sai tài khoản / mật khẩu
  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid email or password') ||
    message.includes('user not found') ||
    status === 400
  ) {
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  // Quá nhiều yêu cầu
  if (
    message.includes('too many requests') ||
    message.includes('email rate limit') ||
    status === 429
  ) {
    return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS;
  }

  // Tài khoản bị khóa / vô hiệu hoá
  if (message.includes('user is banned') || message.includes('account disabled')) {
    return AUTH_ERROR_MESSAGES.ACCOUNT_LOCKED;
  }

  // Network
  if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
    return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Server error
  if (status >= 500) {
    return AUTH_ERROR_MESSAGES.SERVER_ERROR;
  }

  return AUTH_ERROR_MESSAGES.UNKNOWN;
};

/**
 * Service bọc toàn bộ logic Supabase Auth.
 * Không chứa UI logic. Được gọi từ useLogin hook.
 */
export const AuthService = {
  /**
   * Đăng nhập bằng số điện thoại + mật khẩu.
   * Phone được chuyển thành email nội bộ: {phone}@nhatrocothai.vn
   *
   * @param {{ phone: string, password: string, rememberMe: boolean }} credentials
   * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
   */
  async login({ phone, password, rememberMe }) {
    try {
      const email = phoneToEmail(phone);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: mapAuthError(error) };
      }

      // Quản lý "Ghi nhớ đăng nhập"
      // Supabase mặc định lưu session vào localStorage (persist qua lần mở lại browser).
      // Nếu người dùng KHÔNG chọn "Ghi nhớ", ta đánh dấu bằng sessionStorage.
      // AuthContext sẽ kiểm tra flag này khi app khởi động lại.
      if (!rememberMe) {
        sessionStorage.setItem(SESSION_ONLY_KEY, 'true');
      } else {
        sessionStorage.removeItem(SESSION_ONLY_KEY);
      }

      return { success: true, data };
    } catch (error) {
      // Lỗi mạng (TypeError: Failed to fetch)
      if (error instanceof TypeError) {
        return { success: false, error: AUTH_ERROR_MESSAGES.NETWORK_ERROR };
      }
      return { success: false, error: AUTH_ERROR_MESSAGES.SERVER_ERROR };
    }
  },

  /**
   * Đăng xuất — xoá session Supabase và flag sessionOnly.
   * @returns {Promise<void>}
   */
  async logout() {
    sessionStorage.removeItem(SESSION_ONLY_KEY);
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Lấy session hiện tại từ Supabase.
   * @returns {Promise<import('@supabase/supabase-js').Session | null>}
   */
  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Kiểm tra xem session có phải "session only" không.
   * Nếu là session only mà sessionStorage đã bị clear (do browser restart) → cần logout.
   * @param {import('@supabase/supabase-js').Session | null} session
   * @returns {boolean} - true nếu cần force logout
   */
  shouldForceLogout(session) {
    if (!session) return false;
    // Có session trong localStorage (Supabase persist) nhưng sessionStorage flag đã mất
    // → browser đã được khởi động lại, người dùng không chọn "Ghi nhớ" → cần logout
    const isNewBrowserSession = !sessionStorage.getItem(SESSION_ONLY_KEY);
    const wasSessionOnly = localStorage.getItem('auth_was_session_only') === 'true';
    return wasSessionOnly && isNewBrowserSession;
  },

  /**
   * Subscribe vào Supabase Auth state changes.
   * @param {Function} callback
   * @returns {{ data: { subscription: { unsubscribe: Function } } }}
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
