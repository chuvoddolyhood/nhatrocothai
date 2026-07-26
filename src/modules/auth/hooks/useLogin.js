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
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);

  // Kiểm tra Face ID: chỉ hiển thị nếu thiết bị đã đăng ký
  const isFaceIdRegistered = WebAuthnService.isRegistered();
  const isFaceIdSupported = WebAuthnService.isSupported();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  const handleRememberMeChange = (e) => {
    setFormData((prev) => ({ ...prev, rememberMe: e.target.checked }));
  };

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

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
  // Submit & WebAuthn Flows
  // ---------------------------------------------------------------------------

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
        // Đăng nhập thành công
        // Kiểm tra xem thiết bị có hỗ trợ Face ID nhưng chưa đăng ký không
        if (isFaceIdSupported && !isFaceIdRegistered) {
          setShowPasskeyPrompt(true);
          // Ta tạm thời chưa chuyển hướng vội, chờ người dùng phản hồi prompt
        } else {
          navigate('/', { replace: true });
        }
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
   * Đăng nhập trực tiếp bằng Face ID (Passkey).
   */
  const handleFaceIdLogin = async () => {
    setIsLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));

    try {
      const result = await WebAuthnService.authenticate();
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setErrors((prev) => ({ ...prev, general: result.error }));
      }
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: 'Lỗi hệ thống khi đăng nhập Face ID' }));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Người dùng ĐỒNG Ý thiết lập Face ID sau khi đăng nhập thành công
   */
  const handleRegisterPasskey = async () => {
    // Đã đăng nhập mới gọi hàm này được
    const result = await WebAuthnService.register();
    if (!result.success) {
      // Nếu lỗi (người dùng huỷ giữa chừng), vẫn cho họ vào hệ thống nhưng có thể báo lỗi snackbar sau này (ở đây đơn giản bỏ qua)
      console.warn('Đăng ký Face ID thất bại/hủy:', result.error);
    }
    setShowPasskeyPrompt(false);
    navigate('/', { replace: true });
  };

  /**
   * Người dùng BỎ QUA thiết lập Face ID
   */
  const handleSkipPasskey = () => {
    setShowPasskeyPrompt(false);
    navigate('/', { replace: true });
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
    showPasskeyPrompt,

    // Handlers
    handleChange,
    handleRememberMeChange,
    toggleShowPassword,
    handleSubmit,
    handleFaceIdLogin,
    handleRegisterPasskey,
    handleSkipPasskey,
  };
}
