# Test Case 01: Authentication Flow

## Objective
Test toàn bộ authentication flow: login, logout, session management, và "Ghi nhớ đăng nhập"

---

## Pre-requisites
- [ ] Dev server đang chạy: `npm run dev`
- [ ] Supabase database đã migrate schema
- [ ] Test user đã được tạo trong Supabase Auth
- [ ] File `.env` có đầy đủ credentials

## Test User Creation (Do trước nếu chưa có)

### Option 1: Qua Supabase Dashboard
1. Vào https://supabase.com/dashboard/project/ortjhktudenvorquolkj/auth/users
2. Click "Add user" → "Create new user"
3. Nhập:
   - Email: `0901234567@nhatrocothai.vn`
   - Password: `owner123`
   - Auto Confirm User: ✅ Check
4. Click "Create user"
5. Vào SQL Editor, chạy:
```sql
INSERT INTO public.users (full_name, email, phone, role, status)
VALUES (
  'Nguyễn Văn A (Test Owner)',
  '0901234567@nhatrocothai.vn',
  '0901234567',
  'OWNER',
  'ACTIVE'
);
```

---

## Test Scenarios

### 1.1. Login với số điện thoại ✅

**Steps:**
1. Mở browser: http://localhost:5174
2. Verify redirect to `/login`
3. Nhập số điện thoại: `0901234567`
4. Nhập mật khẩu: `owner123`
5. ✅ Check "Ghi nhớ đăng nhập"
6. Click "Đăng nhập"

**Expected Results:**
- ✅ Loading indicator hiện lên
- ✅ Redirect to `/` (Dashboard)
- ✅ Header hiển thị user info
- ✅ No error messages
- ✅ Console không có errors

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.2. Login KHÔNG chọn "Ghi nhớ đăng nhập"

**Steps:**
1. Logout (nếu đang đăng nhập)
2. Nhập số điện thoại: `0901234567`
3. Nhập mật khẩu: `owner123`
4. ⬜ **KHÔNG** check "Ghi nhớ đăng nhập"
5. Click "Đăng nhập"
6. **Đóng browser hoàn toàn** (tất cả tabs)
7. Mở lại browser → vào http://localhost:5174

**Expected Results:**
- ✅ Session được xóa
- ✅ Redirect về `/login`
- ✅ Phải login lại

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.3. Login CÓ chọn "Ghi nhớ đăng nhập"

**Steps:**
1. Login với:
   - Phone: `0901234567`
   - Password: `owner123`
   - ✅ Check "Ghi nhớ đăng nhập"
2. **Đóng browser hoàn toàn**
3. Mở lại browser → vào http://localhost:5174

**Expected Results:**
- ✅ Tự động login (không cần nhập lại)
- ✅ Redirect to Dashboard
- ✅ Session vẫn còn

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.4. Login với sai mật khẩu

**Steps:**
1. Nhập số điện thoại: `0901234567`
2. Nhập mật khẩu: `wrong_password`
3. Click "Đăng nhập"

**Expected Results:**
- ✅ Error message hiện: "Số điện thoại hoặc mật khẩu không đúng"
- ✅ Không redirect
- ✅ Form vẫn còn data

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.5. Login với số điện thoại không tồn tại

**Steps:**
1. Nhập số điện thoại: `0999999999` (chưa đăng ký)
2. Nhập mật khẩu: `anything`
3. Click "Đăng nhập"

**Expected Results:**
- ✅ Error message: "Số điện thoại hoặc mật khẩu không đúng"
- ✅ Không redirect

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.6. Logout

**Steps:**
1. Đăng nhập thành công
2. Click vào user avatar/menu (nếu có)
3. Click "Đăng xuất"

**Expected Results:**
- ✅ Session được xóa
- ✅ Redirect to `/login`
- ✅ localStorage flag `auth_was_session_only` được xóa
- ✅ sessionStorage flag được xóa

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.7. Validate phone number input

**Steps:**
1. Thử nhập các giá trị invalid:
   - `abc` (chữ)
   - `123` (quá ngắn)
   - `0901234567890` (quá dài)

**Expected Results:**
- ✅ Phone field chỉ chấp nhận số
- ✅ Validation message hiện khi invalid
- ✅ Submit button disabled khi invalid

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.8. Protected Route

**Steps:**
1. Logout
2. Manually navigate to: http://localhost:5174/rooms

**Expected Results:**
- ✅ Redirect to `/login`
- ✅ Không thấy RoomListPage

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.9. Session Persistence Across Tabs

**Steps:**
1. Login ở Tab 1
2. Mở Tab 2 → vào http://localhost:5174

**Expected Results:**
- ✅ Tab 2 tự động authenticated
- ✅ Không cần login lại

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

### 1.10. Logout từ một tab → affect all tabs

**Steps:**
1. Login ở Tab 1 và Tab 2
2. Logout ở Tab 1
3. Refresh Tab 2

**Expected Results:**
- ✅ Tab 2 cũng bị logout
- ✅ Redirect to `/login`

**Actual Results:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Summary

| Test Case | Status | Notes |
|---|---|---|
| 1.1 Login thành công | ⬜ | |
| 1.2 Login KHÔNG ghi nhớ | ⬜ | |
| 1.3 Login CÓ ghi nhớ | ⬜ | |
| 1.4 Sai mật khẩu | ⬜ | |
| 1.5 SĐT không tồn tại | ⬜ | |
| 1.6 Logout | ⬜ | |
| 1.7 Validate phone | ⬜ | |
| 1.8 Protected route | ⬜ | |
| 1.9 Multi-tab session | ⬜ | |
| 1.10 Multi-tab logout | ⬜ | |

**Overall Status:** ⬜ Not Started / 🔄 In Progress / ✅ Passed / ❌ Failed

---

## Bugs Found

| Bug ID | Description | Severity | Status |
|---|---|---|---|
| - | - | - | - |

---

## Notes
- Test completed by: ________________
- Date: ________________
- Browser: ________________
- OS: ________________
