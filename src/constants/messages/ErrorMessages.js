export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Trường này không được để trống.',
  INVALID_EMAIL: 'Email không đúng định dạng.',

  // Database / Supabase Constraints
  ROOM_CODE_DUPLICATE: 'Số phòng này đã tồn tại trong khu trọ này!',
  ROOM_CODE_SYSTEM_DUPLICATE: 'Số phòng này đã tồn tại trong hệ thống!',
  EMAIL_DUPLICATE: 'Địa chỉ email này đã được đăng ký bởi người dùng khác!',
  CITIZEN_ID_DUPLICATE: 'Số CCCD/CMND này đã được đăng ký trong hệ thống!',
  CONTRACT_ACTIVE_EXISTS: 'Phòng này đã có hợp đồng đang hoạt động!',
  DUPLICATE_DATA: 'Dữ liệu bị trùng lặp, vui lòng kiểm tra lại thông tin!',

  // Database General Errors
  FOREIGN_KEY_VIOLATION: 'Không thể thực hiện thao tác do dữ liệu liên quan không tồn tại hoặc đang được sử dụng ở bảng khác!',
  NOT_NULL_VIOLATION: 'Vui lòng điền đầy đủ các thông tin bắt buộc!',
  DATA_TOO_LONG: 'Độ dài dữ liệu vượt quá giới hạn cho phép!',
  INVALID_DATA_TYPE: 'Định dạng dữ liệu không hợp lệ hoặc không đúng kiểu dữ liệu!',
  DB_TABLE_NOT_FOUND: 'Bảng cơ sở dữ liệu không tồn tại!',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định',
  DB_CONNECTION_ERROR: 'Đã xảy ra lỗi khi kết nối với cơ sở dữ liệu',

  // General fallback translations
  INVALID_DATA_FORMAT: 'Không thể thực hiện vì dữ liệu liên quan không hợp lệ!'
};

