-- ============================================================
-- NhaTroCoThai - Supabase Migration Script
-- Chạy script này trong Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Bảng users (Người dùng)
CREATE TABLE public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  full_name character varying NOT NULL,
  email character varying UNIQUE,
  phone character varying,
  role character varying NOT NULL,
  status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 2. Bảng properties (Khu trọ)
CREATE TABLE public.properties (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  owner_id bigint NOT NULL,
  name character varying NOT NULL,
  address text,
  room_count integer DEFAULT 0,
  occupied_room_count integer DEFAULT 0,
  status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);

-- 3. Bảng property_users (Liên kết người dùng - khu trọ)
CREATE TABLE public.property_users (
  property_id bigint NOT NULL,
  user_id bigint NOT NULL,
  CONSTRAINT property_users_pkey PRIMARY KEY (property_id, user_id),
  CONSTRAINT property_users_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT property_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- 4. Bảng rooms (Phòng)
CREATE TABLE public.rooms (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_id bigint NOT NULL,
  room_code character varying NOT NULL,
  floor character varying,
  area numeric,
  status character varying NOT NULL,
  current_contract_id bigint,
  current_price numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by bigint,
  updated_by bigint,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT rooms_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT rooms_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

-- 5. Bảng tenants (Khách thuê)
CREATE TABLE public.tenants (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  full_name character varying NOT NULL,
  phone character varying NOT NULL,
  citizen_id character varying NOT NULL,
  birth_date date NOT NULL,
  permanent_address text NOT NULL,
  citizen_id_front_url text,
  citizen_id_back_url text,
  status character varying DEFAULT 'ACTIVE'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by bigint,
  updated_by bigint,
  CONSTRAINT tenants_pkey PRIMARY KEY (id),
  CONSTRAINT tenants_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT tenants_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

-- 6. Bảng contracts (Hợp đồng)
CREATE TABLE public.contracts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_id bigint NOT NULL,
  room_id bigint NOT NULL,
  representative_tenant_id bigint NOT NULL,
  deposit_amount numeric NOT NULL,
  monthly_rent numeric NOT NULL,
  billing_day integer NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status character varying,
  created_by bigint,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  updated_by bigint,
  CONSTRAINT contracts_pkey PRIMARY KEY (id),
  CONSTRAINT contracts_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT contracts_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT contracts_representative_tenant_id_fkey FOREIGN KEY (representative_tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT contracts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

-- 7. Bảng contract_tenants (Liên kết hợp đồng - khách thuê)
CREATE TABLE public.contract_tenants (
  contract_id bigint NOT NULL,
  tenant_id bigint NOT NULL,
  CONSTRAINT contract_tenants_pkey PRIMARY KEY (contract_id, tenant_id),
  CONSTRAINT contract_tenants_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id),
  CONSTRAINT contract_tenants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.room_prices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  room_id bigint NOT NULL,
  price numeric NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by bigint,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by bigint,
  CONSTRAINT room_prices_pkey PRIMARY KEY (id),
  CONSTRAINT room_prices_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT room_prices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT room_prices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

-- 9. Bảng utility_prices (Giá dịch vụ tiện ích)
CREATE TABLE public.utility_prices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_id bigint NOT NULL,
  electric_price numeric NOT NULL,
  water_price numeric NOT NULL,
  internet_price numeric DEFAULT 0,
  service_price numeric DEFAULT 0,
  effective_from date NOT NULL,
  effective_to date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT utility_prices_pkey PRIMARY KEY (id),
  CONSTRAINT utility_prices_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);

-- 10. Bảng meter_readings (Chỉ số điện nước)
CREATE TABLE public.meter_readings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  room_id bigint NOT NULL,
  contract_id bigint NOT NULL,
  month character varying NOT NULL,
  electric_old integer NOT NULL,
  electric_new integer NOT NULL,
  electric_used integer NOT NULL,
  water_old integer NOT NULL,
  water_new integer NOT NULL,
  water_used integer NOT NULL,
  electric_image_url text,
  water_image_url text,
  electric_ocr_text character varying,
  water_ocr_text character varying,
  electric_ocr_confidence numeric,
  water_ocr_confidence numeric,
  verified boolean DEFAULT false,
  verified_by bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT meter_readings_pkey PRIMARY KEY (id),
  CONSTRAINT meter_readings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT meter_readings_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id),
  CONSTRAINT meter_readings_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id)
);

-- 11. Bảng invoices (Hóa đơn)
CREATE TABLE public.invoices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_id bigint NOT NULL,
  room_id bigint NOT NULL,
  contract_id bigint NOT NULL,
  month character varying NOT NULL,
  room_fee numeric NOT NULL,
  electric_price numeric NOT NULL,
  electric_usage integer NOT NULL,
  electric_fee numeric NOT NULL,
  water_price numeric NOT NULL,
  water_usage integer NOT NULL,
  water_fee numeric NOT NULL,
  internet_fee numeric DEFAULT 0,
  service_fee numeric DEFAULT 0,
  other_fees jsonb,
  discount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  room_code character varying,
  representative_tenant_name character varying,
  status character varying DEFAULT 'UNPAID'::character varying,
  due_date date,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT invoices_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT invoices_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.contracts(id)
);

-- 12. Bảng invoice_tenants (Liên kết hóa đơn - khách thuê)
CREATE TABLE public.invoice_tenants (
  invoice_id bigint NOT NULL,
  tenant_id bigint NOT NULL,
  CONSTRAINT invoice_tenants_pkey PRIMARY KEY (invoice_id, tenant_id),
  CONSTRAINT invoice_tenants_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id),
  CONSTRAINT invoice_tenants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- 13. Bảng payments (Thanh toán)
CREATE TABLE public.payments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  invoice_id bigint NOT NULL,
  room_id bigint NOT NULL,
  amount numeric NOT NULL,
  payment_method character varying,
  transaction_code character varying,
  paid_by bigint,
  paid_at timestamp with time zone NOT NULL,
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id),
  CONSTRAINT payments_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT payments_paid_by_fkey FOREIGN KEY (paid_by) REFERENCES public.users(id)
);

-- 14. Bảng monthly_reports (Báo cáo tháng)
CREATE TABLE public.monthly_reports (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  property_id bigint NOT NULL,
  month character varying NOT NULL,
  total_revenue numeric,
  unpaid_amount numeric,
  occupied_rooms integer,
  total_rooms integer,
  occupancy_rate numeric,
  electric_consumption integer,
  water_consumption integer,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT monthly_reports_pkey PRIMARY KEY (id),
  CONSTRAINT monthly_reports_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);

-- 15. Bảng notifications (Thông báo)
CREATE TABLE public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  type character varying,
  target_user_id bigint NOT NULL,
  title character varying,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.users(id)
);

-- 16. Bảng audit_logs (Nhật ký hoạt động)
CREATE TABLE public.audit_logs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  entity_type character varying NOT NULL,
  entity_id bigint NOT NULL,
  action character varying NOT NULL,
  old_value jsonb,
  new_value jsonb,
  performed_by bigint,
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.users(id)
);

-- ============================================================
-- Bật Row Level Security (RLS) — bắt buộc cho Supabase
-- Tạm thời cho phép tất cả truy cập (public)
-- Sau này bạn có thể thêm policy chặt hơn khi có Auth
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy cho phép tất cả thao tác (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow all access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON property_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON contract_tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON room_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON utility_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON meter_readings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON invoice_tenants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON monthly_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
