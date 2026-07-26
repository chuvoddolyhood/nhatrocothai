/**
 * Thông báo lỗi dành riêng cho module xác thực (Auth).
 * Tất cả chuỗi đều bằng tiếng Việt, thân thiện với người dùng không rành công nghệ.
 */
export const AUTH_ERROR_MESSAGES = {
  // Validation
  PHONE_REQUIRED: 'Vui lòng nhập số điện thoại.',
  PHONE_INVALID: 'Số điện thoại không đúng định dạng Việt Nam (VD: 0912 345 678).',
  PASSWORD_REQUIRED: 'Vui lòng nhập mật khẩu.',

  // API Errors
  INVALID_CREDENTIALS: 'Số điện thoại hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
  TOO_MANY_REQUESTS: 'Bạn đã thử quá nhiều lần. Vui lòng chờ vài phút rồi thử lại.',

  // Network / System
  NETWORK_ERROR: 'Không có kết nối mạng. Vui lòng kiểm tra wifi hoặc dữ liệu di động.',
  TIMEOUT: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
  SERVER_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.',
  UNKNOWN: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
};
