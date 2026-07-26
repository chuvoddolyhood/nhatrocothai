/**
 * Data Transfer Objects & initial states cho Login form.
 */

/** State ban đầu của form đăng nhập */
export const INITIAL_LOGIN_FORM = {
  phone: '',
  password: '',
  rememberMe: false,
};

/** State ban đầu của object lỗi */
export const INITIAL_LOGIN_ERRORS = {
  phone: '',
  password: '',
  general: '',
};
