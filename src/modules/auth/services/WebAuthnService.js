/**
 * WebAuthnService — Stub chuẩn bị sẵn cho tích hợp Face ID / Passkey (WebAuthn).
 *
 * Hiện tại: tất cả methods đều trả về trạng thái "chưa hỗ trợ".
 * Khi backend sẵn sàng, chỉ cần implement phần body của từng method
 * mà không cần thay đổi interface hay UI.
 *
 * Flow dự kiến (tương lai):
 *   Lần đầu: Login bằng SĐT/MK → sau khi thành công → gọi register()
 *   Lần sau: Nếu isRegistered() → hiển thị button → gọi authenticate()
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
   * Hiện tại: luôn trả về false (chưa implement backend).
   * Tương lai: kiểm tra localStorage hoặc gọi API.
   * @returns {boolean}
   */
  isRegistered() {
    // TODO: Implement khi có backend WebAuthn
    // Ví dụ: return !!localStorage.getItem('webauthn_credential_id');
    return false;
  },

  /**
   * Đăng ký Passkey mới cho thiết bị này sau khi đăng nhập thành công.
   * @param {string} userId
   * @returns {Promise<{ success: boolean }>}
   */
  async register(userId) {
    // TODO: Implement WebAuthn registration flow
    // 1. Gọi backend để lấy PublicKeyCredentialCreationOptions
    // 2. Gọi navigator.credentials.create()
    // 3. Gửi credential về backend để lưu
    throw new Error('[WebAuthnService] register() chưa được implement. Cần có backend WebAuthn.');
  },

  /**
   * Xác thực bằng Passkey (Face ID / Touch ID).
   * @returns {Promise<{ success: boolean, token?: string }>}
   */
  async authenticate() {
    // TODO: Implement WebAuthn authentication flow
    // 1. Gọi backend để lấy PublicKeyCredentialRequestOptions
    // 2. Gọi navigator.credentials.get()
    // 3. Gửi assertion về backend để verify và nhận JWT
    throw new Error('[WebAuthnService] authenticate() chưa được implement. Cần có backend WebAuthn.');
  },

  /**
   * Xoá Passkey đã đăng ký trên thiết bị này.
   * @returns {void}
   */
  unregister() {
    // TODO: Implement khi có backend WebAuthn
    // localStorage.removeItem('webauthn_credential_id');
  },
};
