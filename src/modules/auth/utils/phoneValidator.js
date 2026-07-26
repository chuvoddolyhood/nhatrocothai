/**
 * Tiện ích kiểm tra và chuẩn hoá số điện thoại Việt Nam.
 */

/**
 * Regex chuẩn số điện thoại Việt Nam.
 * Hỗ trợ:
 *   - 10 chữ số bắt đầu bằng 0 (VD: 0912345678)
 *   - Định dạng +84 (VD: +84912345678)
 * Đầu số hợp lệ: 03x, 05x, 07x, 08x, 09x
 */
const VIETNAM_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[06-9]|8[0-9]|9[0-9])\d{7}$/;

/**
 * Chuẩn hoá số điện thoại: xoá khoảng trắng và dấu gạch ngang.
 * @param {string} phone
 * @returns {string}
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  return phone.trim().replace(/[\s\-().]/g, '');
};

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ.
 * @param {string} phone - Số đã được normalizePhone()
 * @returns {boolean}
 */
export const validateVietnamesePhone = (phone) => {
  if (!phone) return false;
  return VIETNAM_PHONE_REGEX.test(phone);
};

/**
 * Chuyển số điện thoại thành email nội bộ dùng cho Supabase Auth.
 * Convention: {phone}@nhatrocothai.vn
 * @param {string} phone - Số đã được normalizePhone()
 * @returns {string}
 */
export const phoneToEmail = (phone) => {
  return `${phone}@nhatrocothai.vn`;
};
