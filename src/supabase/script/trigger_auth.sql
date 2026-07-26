-- 1. Xóa Trigger cũ (đề phòng chạy lại bị lỗi)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user;

-- 2. Tạo hàm ánh xạ thông tin sang bảng public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (auth_id, phone, email, full_name, role)
  values (
    new.id, 
    -- Tự động tách số điện thoại từ email (cắt bỏ phần @nhatrocothai.vn)
    split_part(new.email, '@', 1),
    new.email,
    -- Nếu không có tên, để mặc định là "Chủ Trọ Mới" (vì cột này NOT NULL)
    COALESCE(new.raw_user_meta_data->>'full_name', 'Chủ Trọ Mới'),
    -- Gán quyền mặc định
    'LANDLORD'
  );
  return new;
end;
$$;

-- 3. Gắn Trigger chạy tự động mỗi khi có user mới
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
