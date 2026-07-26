import { supabase } from '../../../supabase/config';

const PASSKEY_FLAG_KEY = 'passkey_registered';

/**
 * WebAuthnService — Quản lý Đăng nhập bằng Face ID / Touch ID (Passkeys).
 * Sử dụng Supabase Experimental Passkeys.
 */
export const WebAuthnService = {
  /**
   * Kiểm tra trình duyệt có hỗ trợ WebAuthn / Passkey không.
   * @returns {boolean}
   */
  isSupported() {
    return (
      typeof window !== 'undefined' &&
      !!window.PublicKeyCredential &&
      !!window.navigator.credentials
    );
  },

  /**
   * Kiểm tra thiết bị này đã đăng ký Passkey chưa.
   * Supabase lưu trữ public key trên server. Ta lưu 1 flag nhỏ dưới localStorage
   * để biết thiết bị này có khả năng dùng Face ID hay không (nhằm mục đích bật/tắt nút giao diện).
   * @returns {boolean}
   */
  isRegistered() {
    return localStorage.getItem(PASSKEY_FLAG_KEY) === 'true';
  },

  /**
   * Đăng ký Passkey mới cho thiết bị này.
   * Chỉ hoạt động khi người dùng ĐÃ ĐĂNG NHẬP bằng mật khẩu thành công.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async register() {
    try {
      const { data, error } = await supabase.auth.registerPasskey();
      if (error) {
        console.error('[WebAuthnService] Lỗi khi đăng ký Passkey:', error.message);
        return { success: false, error: error.message };
      }
      
      // Đánh dấu thiết bị này đã có passkey
      localStorage.setItem(PASSKEY_FLAG_KEY, 'true');
      return { success: true };
    } catch (err) {
      console.error('[WebAuthnService] Lỗi không mong đợi khi đăng ký Passkey:', err);
      return { success: false, error: 'Lỗi khi thiết lập Face ID' };
    }
  },

  /**
   * Xác thực bằng Passkey (Face ID / Touch ID).
   * Sử dụng Discoverable Credentials (không cần nhập email).
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async authenticate() {
    try {
      const { data, error } = await supabase.auth.signInWithPasskey();
      if (error) {
        console.error('[WebAuthnService] Lỗi khi đăng nhập bằng Passkey:', error.message);
        return { success: false, error: 'Đăng nhập Face ID thất bại hoặc bị hủy' };
      }
      return { success: true };
    } catch (err) {
      console.error('[WebAuthnService] Lỗi không mong đợi khi đăng nhập:', err);
      return { success: false, error: 'Lỗi hệ thống khi đăng nhập Face ID' };
    }
  },

  /**
   * Đánh dấu huỷ đăng ký Passkey trên thiết bị này.
   * @returns {void}
   */
  unregister() {
    localStorage.removeItem(PASSKEY_FLAG_KEY);
  },
};
