import React from 'react';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ScanFace,
} from 'lucide-react';

/**
 * LoginForm — Component UI thuần cho form đăng nhập.
 *
 * Không chứa business logic. Toàn bộ state và handlers được
 * truyền vào từ useLogin hook thông qua LoginPage.
 *
 * @param {object} props
 * @param {object}   props.formData           - Giá trị hiện tại của form
 * @param {object}   props.errors             - Object chứa lỗi của từng field
 * @param {boolean}  props.isLoading          - Đang gửi request
 * @param {boolean}  props.showPassword       - Toggle hiển thị mật khẩu
 * @param {boolean}  props.isFaceIdRegistered - Thiết bị đã đăng ký Face ID
 * @param {Function} props.handleChange       - Handler thay đổi field
 * @param {Function} props.handleRememberMeChange - Handler checkbox
 * @param {Function} props.toggleShowPassword  - Handler toggle password
 * @param {Function} props.handleSubmit        - Handler submit form
 * @param {Function} props.handleFaceIdLogin   - Handler đăng nhập Face ID
 */
const LoginForm = ({
  formData,
  errors,
  isLoading,
  showPassword,
  isFaceIdRegistered,
  handleChange,
  handleRememberMeChange,
  toggleShowPassword,
  handleSubmit,
  handleFaceIdLogin,
}) => {
  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">

        {/* ── Thông báo lỗi tổng quát (sai tài khoản, lỗi server...) ── */}
        {errors.general && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ borderRadius: '12px', fontSize: '0.875rem' }}
          >
            {errors.general}
          </Alert>
        )}

        {/* ── Số điện thoại ── */}
        <TextField
          id="login-phone"
          label="Số điện thoại"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          autoFocus
          fullWidth
          required
          disabled={isLoading}
          value={formData.phone}
          onChange={handleChange('phone')}
          error={!!errors.phone}
          helperText={errors.phone || ' '}
          placeholder="VD: 0912 345 678"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Phone size={18} className="text-indigo-400" />
                </InputAdornment>
              ),
            },
            htmlInput: {
              maxLength: 15,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
          }}
        />

        {/* ── Mật khẩu ── */}
        <TextField
          id="login-password"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          fullWidth
          required
          disabled={isLoading}
          value={formData.password}
          onChange={handleChange('password')}
          error={!!errors.password}
          helperText={errors.password || ' '}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={18} className="text-indigo-400" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    id="toggle-password-visibility"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={toggleShowPassword}
                    edge="end"
                    disabled={isLoading}
                    size="small"
                  >
                    {showPassword
                      ? <EyeOff size={18} className="text-gray-400" />
                      : <Eye size={18} className="text-gray-400" />
                    }
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&.Mui-focused fieldset': { borderColor: '#6366f1' },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: '#6366f1' },
          }}
        />

        {/* ── Ghi nhớ đăng nhập ── */}
        <FormControlLabel
          control={
            <Checkbox
              id="login-remember-me"
              checked={formData.rememberMe}
              onChange={handleRememberMeChange}
              disabled={isLoading}
              sx={{
                color: '#6366f1',
                '&.Mui-checked': { color: '#6366f1' },
              }}
              size="small"
            />
          }
          label={
            <span className="text-sm text-gray-600">
              Ghi nhớ đăng nhập <span className="text-gray-400">(30 ngày)</span>
            </span>
          }
          sx={{ margin: 0, mt: -1 }}
        />

        {/* ── Nút Đăng nhập ── */}
        <Button
          id="login-submit-btn"
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          size="medium"
          startIcon={
            isLoading
              ? <CircularProgress size={18} color="inherit" />
              : <LogIn size={18} />
          }
          sx={{
            borderRadius: '12px',
            py: 1.25,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #5254cc 0%, #7c3aed 100%)',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&.Mui-disabled': {
              background: 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)',
              color: 'white',
            },
          }}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        {/* ── Divider Face ID ── */}
        <div className="flex items-center gap-3 my-1">
          <Divider sx={{ flex: 1 }} />
          <span className="text-xs text-gray-400 whitespace-nowrap">hoặc</span>
          <Divider sx={{ flex: 1 }} />
        </div>

        {/* ── Nút Face ID (placeholder) ── */}
        <Tooltip
          title={
            isFaceIdRegistered
              ? 'Đăng nhập bằng Face ID'
              : 'Chưa đăng ký Face ID trên thiết bị này'
          }
          arrow
          placement="top"
        >
          {/* Bọc trong span vì Tooltip cần forwardRef khi button disabled */}
          <span className="w-full">
            <Button
              id="login-face-id-btn"
              type="button"
              variant="outlined"
              fullWidth
              disabled={!isFaceIdRegistered || isLoading}
              onClick={handleFaceIdLogin}
              size="medium"
              startIcon={<ScanFace size={20} />}
              sx={{
                borderRadius: '12px',
                py: 1,
                borderColor: isFaceIdRegistered ? '#6366f1' : '#e5e7eb',
                color: isFaceIdRegistered ? '#6366f1' : '#9ca3af',
                fontWeight: 500,
                fontSize: '0.9rem',
                width: '100%',
                transition: 'all 0.2s ease',
                '&:hover:not(:disabled)': {
                  borderColor: '#6366f1',
                  background: 'rgba(99, 102, 241, 0.04)',
                },
                '&.Mui-disabled': {
                  borderColor: '#e5e7eb',
                  color: '#9ca3af',
                },
              }}
            >
              Đăng nhập bằng Face ID
            </Button>
          </span>
        </Tooltip>

        {/* Chú thích Face ID */}
        {!isFaceIdRegistered && (
          <p className="text-center text-xs text-gray-400 -mt-2">
            Đăng nhập thành công lần đầu để thiết lập Face ID
          </p>
        )}

        {/* ── Liên hệ Admin khi chưa có tài khoản ── */}
        <div className="mt-1 text-center">
          <p className="text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <a
              href="#"
              className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors underline-offset-2 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                alert('Vui lòng liên hệ Admin qua Zalo hoặc Hotline: 0939635755 để được cấp tài khoản Chủ trọ.');
              }}
            >
              Liên hệ Admin
            </a>
          </p>
        </div>

      </div>
    </form>
  );
};

export default LoginForm;
