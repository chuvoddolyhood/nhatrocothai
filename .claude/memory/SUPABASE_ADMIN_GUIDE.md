# Hướng dẫn quản trị Supabase cho NhaTroCoThai

## 🔐 Reset Password cho User

### Cách 1: Qua Supabase Dashboard (Recommended)

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Chọn project: **ortjhktudenvorquolkj**
3. Vào **Authentication** → **Users**
4. Tìm user cần reset password
5. Click vào user → Click **"Send Password Recovery Email"**
6. User sẽ nhận email reset password

### Cách 2: Tạo user mới với password mới

1. Vào **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Nhập:
   - **Email:** `{số_điện_thoại}@nhatrocothai.vn` (ví dụ: `0987654321@nhatrocothai.vn`)
   - **Password:** Password mới
   - **Auto Confirm User:** ✅ Check (bỏ qua xác thực email)
4. Click **"Create user"**

### Cách 3: Update password trực tiếp qua SQL (Admin only)

```sql
-- Lấy user ID
SELECT id, email FROM auth.users WHERE email LIKE '%@nhatrocothai.vn';

-- Reset password (Supabase sẽ hash tự động)
UPDATE auth.users 
SET encrypted_password = crypt('password_moi_123', gen_salt('bf'))
WHERE email = '0987654321@nhatrocothai.vn';
```

---

## 👤 Tạo Test Users

### Owner (Chủ nhà)

```sql
-- Tạo user trong auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  '0901234567@nhatrocothai.vn',
  crypt('owner123', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- Tạo user profile trong public.users
INSERT INTO public.users (full_name, email, phone, role, status)
VALUES (
  'Nguyễn Văn A (Chủ Nhà)',
  '0901234567@nhatrocothai.vn',
  '0901234567',
  'OWNER',
  'ACTIVE'
);
```

### Test Data Set

| Tài khoản | Password | Role |
|---|---|---|
| `0901234567@nhatrocothai.vn` | `owner123` | OWNER |
| `0902345678@nhatrocothai.vn` | `owner123` | OWNER |

---

## 📊 Kiểm tra Database Connection

### Test qua Supabase SQL Editor

```sql
-- Kiểm tra users
SELECT * FROM public.users LIMIT 5;

-- Kiểm tra properties
SELECT * FROM public.properties LIMIT 5;

-- Kiểm tra rooms
SELECT * FROM public.rooms LIMIT 5;

-- Kiểm tra contracts
SELECT * FROM public.contracts LIMIT 5;
```

---

## 🔒 Row Level Security (RLS) Policies

### Current Status: ⚠️ OPEN POLICIES

Hiện tại tất cả bảng đang dùng policy mở: `USING (true)`

### 🚨 TODO: Tighten RLS cho Production

```sql
-- Ví dụ: Chỉ cho owner xem properties của họ
DROP POLICY IF EXISTS "allow_all" ON public.properties;

CREATE POLICY "owners_see_their_properties" ON public.properties
  FOR SELECT
  USING (
    owner_id = (SELECT id FROM public.users WHERE email = auth.jwt()->>'email')
  );
```

---

## 📱 Testing Checklist

- [ ] Test login với số điện thoại
- [ ] Test "Ghi nhớ đăng nhập" (rememberMe)
- [ ] Test logout
- [ ] Test session persistence (đóng/mở lại browser)
- [ ] Test password reset flow
- [ ] Test CRUD operations với authenticated user
- [ ] Test RLS policies (khi đã tighten)

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/ortjhktudenvorquolkj
- **API Settings:** https://supabase.com/dashboard/project/ortjhktudenvorquolkj/settings/api
- **SQL Editor:** https://supabase.com/dashboard/project/ortjhktudenvorquolkj/editor
- **Auth Users:** https://supabase.com/dashboard/project/ortjhktudenvorquolkj/auth/users

---

## 📝 Environment Variables

Đảm bảo file `.env` có đầy đủ:

```bash
VITE_SUPABASE_URL=https://ortjhktudenvorquolkj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_FzFoSgvYrYcCWN3w_Dwzeg_YoZeq3xB
```

⚠️ **KHÔNG bao giờ commit file `.env` lên Git!**
