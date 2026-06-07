-- ============================================================
-- NhaTroCoThai - Supabase Migration Script
-- Chạy script này trong Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Bảng users (Người dùng)
CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Bảng properties (Khu trọ)
CREATE TABLE properties (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    room_count INTEGER DEFAULT 0,
    occupied_room_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bảng property_users (Liên kết người dùng - khu trọ)
CREATE TABLE property_users (
    property_id BIGINT NOT NULL REFERENCES properties(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    PRIMARY KEY(property_id, user_id)
);

-- 4. Bảng rooms (Phòng)
CREATE TABLE rooms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    room_code VARCHAR(50) NOT NULL,
    floor VARCHAR(50),
    area NUMERIC(10,2),
    status VARCHAR(20) NOT NULL,
    current_contract_id BIGINT,
    current_price NUMERIC(15,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT NULL REFERENCES users(id),
    updated_by BIGINT NULL REFERENCES users(id)
);

-- 5. Bảng tenants (Khách thuê)
CREATE TABLE tenants (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    citizen_id VARCHAR(20),
    birth_date DATE,
    permanent_address TEXT,
    citizen_id_front_url TEXT,
    citizen_id_back_url TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by BIGINT NULL REFERENCES users(id),
    updated_by BIGINT NULL REFERENCES users(id)
);

-- 6. Bảng contracts (Hợp đồng)
CREATE TABLE contracts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    room_id BIGINT NOT NULL REFERENCES rooms(id),
    representative_tenant_id BIGINT REFERENCES tenants(id),
    deposit_amount NUMERIC(15,2),
    monthly_rent NUMERIC(15,2),
    billing_day INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Bảng contract_tenants (Liên kết hợp đồng - khách thuê)
CREATE TABLE contract_tenants (
    contract_id BIGINT NOT NULL REFERENCES contracts(id),
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    PRIMARY KEY(contract_id, tenant_id)
);

-- 8. Bảng room_prices (Lịch sử giá phòng)
CREATE TABLE room_prices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id),
    price NUMERIC(15,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Bảng utility_prices (Giá dịch vụ tiện ích)
CREATE TABLE utility_prices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    electric_price NUMERIC(15,2) NOT NULL,
    water_price NUMERIC(15,2) NOT NULL,
    internet_price NUMERIC(15,2) DEFAULT 0,
    service_price NUMERIC(15,2) DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Bảng meter_readings (Chỉ số điện nước)
CREATE TABLE meter_readings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES rooms(id),
    contract_id BIGINT NOT NULL REFERENCES contracts(id),
    month VARCHAR(7) NOT NULL,
    electric_old INTEGER NOT NULL,
    electric_new INTEGER NOT NULL,
    electric_used INTEGER NOT NULL,
    water_old INTEGER NOT NULL,
    water_new INTEGER NOT NULL,
    water_used INTEGER NOT NULL,
    electric_image_url TEXT,
    water_image_url TEXT,
    electric_ocr_text VARCHAR(50),
    water_ocr_text VARCHAR(50),
    electric_ocr_confidence NUMERIC(5,2),
    water_ocr_confidence NUMERIC(5,2),
    verified BOOLEAN DEFAULT FALSE,
    verified_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, month)
);

-- 11. Bảng invoices (Hóa đơn)
CREATE TABLE invoices (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    room_id BIGINT NOT NULL REFERENCES rooms(id),
    contract_id BIGINT NOT NULL REFERENCES contracts(id),
    month VARCHAR(7) NOT NULL,
    room_fee NUMERIC(15,2) NOT NULL,
    electric_price NUMERIC(15,2) NOT NULL,
    electric_usage INTEGER NOT NULL,
    electric_fee NUMERIC(15,2) NOT NULL,
    water_price NUMERIC(15,2) NOT NULL,
    water_usage INTEGER NOT NULL,
    water_fee NUMERIC(15,2) NOT NULL,
    internet_fee NUMERIC(15,2) DEFAULT 0,
    service_fee NUMERIC(15,2) DEFAULT 0,
    other_fees JSONB,
    discount NUMERIC(15,2) DEFAULT 0,
    total_amount NUMERIC(15,2) NOT NULL,
    room_code VARCHAR(50),
    representative_tenant_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'UNPAID',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Bảng invoice_tenants (Liên kết hóa đơn - khách thuê)
CREATE TABLE invoice_tenants (
    invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    PRIMARY KEY(invoice_id, tenant_id)
);

-- 13. Bảng payments (Thanh toán)
CREATE TABLE payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id),
    room_id BIGINT NOT NULL REFERENCES rooms(id),
    amount NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(30),
    transaction_code VARCHAR(100),
    paid_by BIGINT REFERENCES users(id),
    paid_at TIMESTAMPTZ NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Bảng monthly_reports (Báo cáo tháng)
CREATE TABLE monthly_reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    month VARCHAR(7) NOT NULL,
    total_revenue NUMERIC(15,2),
    unpaid_amount NUMERIC(15,2),
    occupied_rooms INTEGER,
    total_rooms INTEGER,
    occupancy_rate NUMERIC(5,2),
    electric_consumption INTEGER,
    water_consumption INTEGER,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(property_id, month)
);

-- 15. Bảng notifications (Thông báo)
CREATE TABLE notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type VARCHAR(50),
    target_user_id BIGINT NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Bảng audit_logs (Nhật ký hoạt động)
CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    performed_by BIGINT REFERENCES users(id),
    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
