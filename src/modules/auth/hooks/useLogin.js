import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/AuthService';
import { WebAuthnService } from '../services/WebAuthnService';
import { validateVietnamesePhone, normalizePhone } from '../utils/phoneValidator';
import { AUTH_ERROR_MESSAGES } from '../constants/AuthErrorMessages';
import { INITIAL_LOGIN_FORM, INITIAL_LOGIN_ERRORS } from '../dto/LoginDTO';

/**
 * useLogin — Hook chứa toàn bộ business logic của màn hình Đăng nhập.
 *
 * Tách biệt hoàn toàn khỏi UI:
 *   - Form state management
 *   - Client-side validation
 *   - API call qua AuthService
 *   - Loading / error states
 *   - Navigation sau khi đăng nhập thành công
 *   - WebAuthn readiness check
 *
 * @returns {object} - Tất cả state và handlers cần thiết cho LoginForm
 */
export function useLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_LOGIN_FORM);
  const [errors, setErrors] = useState(INITIAL_LOGIN_ERRORS);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Kiểm tra Face ID: chỉ hiển thị nếu thiết bị đã đăng ký
  const isFaceIdRegistered = WebAuthnService.isRegistered();
  const isFaceIdSupported = WebAuthnService.isSupported();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  /**
   * Cập nhật giá trị field và xoá lỗi của field đó ngay khi người dùng gõ.
   * @param {string} field - Tên field trong formData
   */
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Xoá lỗi field khi người dùng bắt đầu sửa
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Xoá lỗi general khi người dùng tương tác lại
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  /** Toggle checkbox "Ghi nhớ đăng nhập" */
  const handleRememberMeChange = (e) => {
    setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }));
  };

  /** Toggle hiển thị / ẩn mật khẩu */
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  /**
   * Validate toàn bộ form trước khi submit.
   * @returns {boolean} - true nếu hợp lệ
   */
  const validate = () => {
    const newErrors = { ...INITIAL_LOGIN_ERRORS };
    let isValid = true;

    const normalizedPhone = normalizePhone(formData.phone);

    if (!normalizedPhone) {
      newErrors.phone = AUTH_ERROR_MESSAGES.PHONE_REQUIRED;
      isValid = false;
    } else if (!validateVietnamesePhone(normalizedPhone)) {
      newErrors.phone = AUTH_ERROR_MESSAGES.PHONE_INVALID;
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = AUTH_ERROR_MESSAGES.PASSWORD_REQUIRED;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  /**
   * Xử lý submit form đăng nhập.
   * Validate → call AuthService.login() → navigate hoặc hiển thị lỗi.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      const result = await AuthService.login({
        phone: normalizePhone(formData.phone),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (result.success) {
        // Đăng nhập thành công → chuyển về trang chính
        navigate('/', { replace: true });
      } else {
        setErrors((prev) => ({ ...prev, general: result.error }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, general: AUTH_ERROR_MESSAGES.SERVER_ERROR }));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Xử lý đăng nhập bằng Face ID (WebAuthn).
   * Hiện tại: không làm gì — placeholder cho tương lai.
   */
  const handleFaceIdLogin = async () => {
    // TODO: Implement khi WebAuthnService.authenticate() sẵn sàng
    // const result = await WebAuthnService.authenticate();
    // if (result.success) navigate('/', { replace: true });
  };

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // State
    formData,
    errors,
    isLoading,
    showPassword,
    isFaceIdRegistered,
    isFaceIdSupported,

    // Handlers
    handleChange,
    handleRememberMeChange,
    toggleShowPassword,
    handleSubmit,
    handleFaceIdLogin,
  };
}
