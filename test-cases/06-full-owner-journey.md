# Test Case 06: Full Owner Journey — End-to-End

## Objective
Test toàn bộ journey của Owner từ onboarding → tạo property → rooms → tenants → contracts → billing cycle

**Đây là test case QUAN TRỌNG NHẤT** - mô phỏng real-world usage.

---

## Story: Chủ nhà Cô Thái bắt đầu sử dụng app

Cô Thái có một dãy nhà trọ 5 phòng ở TP.HCM. Cô muốn:
1. Quản lý thông tin phòng trọ
2. Lưu thông tin khách thuê
3. Tạo hợp đồng cho khách thuê
4. Mỗi tháng ghi chỉ số điện nước và tạo hóa đơn

---

## Pre-requisites
- [ ] Owner đã tạo account và login thành công
- [ ] Database trống (hoặc có ít data)

---

## Phase 1: Onboarding — Lần đầu sử dụng app

### Step 1.1: First Login
**Actions:**
1. Login với account `0901234567`
2. Vào Dashboard

**Expected:**
- ✅ Dashboard hiển thị empty state
- ✅ Message: "Chưa có dữ liệu" hoặc tương tự
- ✅ Có button/CTA để "Thêm phòng mới" hoặc "Bắt đầu"

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 1.2: Navigate to Rooms Page
**Actions:**
1. Click vào "Phòng trọ" trong bottom navigation
2. Observe empty state

**Expected:**
- ✅ Empty state với message khuyến khích tạo phòng
- ✅ Button "Thêm phòng" (FAB hoặc tương tự)

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Phase 2: Tạo Property (Nếu có module Properties)

### Step 2.1: Create Property
**Actions:**
1. Nếu có module Properties → Tạo property mới
2. Nhập thông tin:
   - Tên: "Nhà Trọ Cô Thái"
   - Địa chỉ: "123 Đường ABC, Quận 1, TP.HCM"

**Expected:**
- ✅ Property được tạo thành công
- ✅ Success notification

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________
- [ ] N/A (Module chưa có)

---

## Phase 3: Tạo 5 Phòng Trọ

### Step 3.1: Create Room P101
**Actions:**
1. Click "Thêm phòng"
2. Nhập:
   - Mã phòng: `P101`
   - Tầng: `1`
   - Diện tích: `20` m²
   - Giá thuê: `3,000,000` VND
   - Trạng thái: `Phòng trống`
3. Click "Lưu"

**Expected:**
- ✅ Phòng được tạo thành công
- ✅ Hiển thị trong danh sách
- ✅ Status = AVAILABLE
- ✅ Price history được tạo trong `room_prices`

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 3.2: Create Room P102
**Actions:**
Repeat với:
- Mã phòng: `P102`
- Tầng: `1`
- Diện tích: `25` m²
- Giá: `3,500,000` VND

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 3.3: Create Room P201
**Actions:**
Repeat với:
- Mã phòng: `P201`
- Tầng: `2`
- Diện tích: `20` m²
- Giá: `3,000,000` VND

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 3.4: Create Room P202
**Actions:**
Repeat với:
- Mã phòng: `P202`
- Tầng: `2`
- Diện tích: `30` m²
- Giá: `4,000,000` VND

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 3.5: Create Room P203
**Actions:**
Repeat với:
- Mã phòng: `P203`
- Tầng: `2`
- Diện tích: `25` m²
- Giá: `3,500,000` VND

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 3.6: Verify Room List
**Actions:**
1. Xem danh sách phòng
2. Filter by "Phòng trống"

**Expected:**
- ✅ Hiển thị 5 phòng
- ✅ Tất cả status = AVAILABLE
- ✅ Thông tin đúng (mã, giá, diện tích)

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Phase 4: Đăng ký Khách Thuê

### Step 4.1: Navigate to Tenants
**Actions:**
1. Click "Khách thuê" trong bottom nav

**Expected:**
- ✅ Empty state

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 4.2: Create Tenant — Nguyễn Văn A
**Actions:**
1. Click "Thêm khách thuê"
2. Nhập:
   - Họ tên: `Nguyễn Văn A`
   - SĐT: `0912345678`
   - CCCD: `001234567890`
   - Ngày sinh: `15/03/1995`
   - Địa chỉ thường trú: `456 Đường ABC, Quận 2, TP.HCM`
3. Click "Lưu" (chưa upload ảnh CCCD)

**Expected:**
- ✅ Tenant được tạo
- ✅ Status = ACTIVE
- ✅ Hiển thị trong danh sách

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 4.3: Create Tenant — Trần Thị B
**Actions:**
Repeat với:
- Họ tên: `Trần Thị B`
- SĐT: `0923456789`
- CCCD: `001234567891`
- Ngày sinh: `20/07/1997`
- Địa chỉ: `789 Đường XYZ, Quận 3, TP.HCM`

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 4.4: Create Tenant — Lê Văn C
**Actions:**
Repeat với:
- Họ tên: `Lê Văn C`
- SĐT: `0934567890`
- CCCD: `001234567892`
- Ngày sinh: `05/11/1993`
- Địa chỉ: `321 Đường DEF, Quận 4, TP.HCM`

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 4.5: Verify Tenant List
**Actions:**
1. Xem danh sách khách thuê
2. Verify có 3 người

**Expected:**
- ✅ Hiển thị 3 tenants
- ✅ Thông tin chính xác
- ✅ Status = ACTIVE

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Phase 5: Tạo Hợp Đồng Thuê

### Step 5.1: Navigate to Contracts
**Actions:**
1. Click "Hợp đồng" trong bottom nav

**Expected:**
- ✅ Empty state

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 5.2: Create Contract #1 — Nguyễn Văn A thuê P101
**Actions:**
1. Click "Tạo hợp đồng"
2. Chọn phòng: `P101`
3. Chọn người đại diện: `Nguyễn Văn A`
4. Số tiền cọc: `6,000,000` VND (2 tháng)
5. Tiền thuê hàng tháng: `3,000,000` VND
6. Ngày thu tiền: `5` (mỗi tháng)
7. Ngày bắt đầu: `01/09/2026`
8. Ngày kết thúc: (để trống = không thời hạn)
9. Click "Lưu"

**Expected:**
- ✅ Contract được tạo
- ✅ Status = ACTIVE
- ✅ Room P101 status → OCCUPIED
- ✅ Room P101 `current_contract_id` được set
- ✅ Junction table `contract_tenants` có record

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 5.3: Verify P101 Status Changed
**Actions:**
1. Vào "Phòng trọ"
2. Tìm P101

**Expected:**
- ✅ Status = "Đang thuê" / OCCUPIED
- ✅ Badge hiển thị contract info

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 5.4: Create Contract #2 — Trần Thị B + Lê Văn C thuê P202
**Actions:**
1. Click "Tạo hợp đồng"
2. Chọn phòng: `P202`
3. Người đại diện: `Trần Thị B`
4. **Thêm người thuê cùng:** `Lê Văn C` (nếu UI hỗ trợ)
5. Tiền cọc: `8,000,000` VND
6. Tiền thuê: `4,000,000` VND
7. Ngày thu: `10`
8. Ngày bắt đầu: `01/09/2026`
9. Click "Lưu"

**Expected:**
- ✅ Contract được tạo với 2 tenants
- ✅ P202 → OCCUPIED
- ✅ `contract_tenants` có 2 records

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 5.5: Verify Contract List
**Actions:**
1. Xem danh sách hợp đồng

**Expected:**
- ✅ Hiển thị 2 contracts
- ✅ Thông tin đầy đủ (phòng, tenant, giá)
- ✅ Status = ACTIVE

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Phase 6: Dashboard Overview

### Step 6.1: View Dashboard Statistics
**Actions:**
1. Vào Dashboard

**Expected:**
- ✅ Tổng số phòng: **5**
- ✅ Phòng đang thuê: **2** (P101, P202)
- ✅ Phòng trống: **3** (P102, P201, P203)
- ✅ Tỷ lệ lấp đầy: **40%**
- ✅ Tổng khách thuê: **3**
- ✅ Hợp đồng đang hoạt động: **2**

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Phase 7: Update Scenarios

### Step 7.1: Update Room Price
**Actions:**
1. Vào phòng P102
2. Thay đổi giá từ 3,500,000 → 3,800,000
3. Lưu

**Expected:**
- ✅ Price updated
- ✅ Old price history closed (`effective_to` set)
- ✅ New price history created

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 7.2: Update Tenant Information
**Actions:**
1. Vào tenant "Nguyễn Văn A"
2. Thay đổi SĐT → `0912345679`
3. Lưu

**Expected:**
- ✅ Tenant updated
- ✅ Contract vẫn intact

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 7.3: Terminate Contract
**Actions:**
1. Vào contract của P101
2. Click "Chấm dứt hợp đồng"
3. Confirm

**Expected:**
- ✅ Contract status → TERMINATED
- ✅ `end_date` = hôm nay
- ✅ P101 status → AVAILABLE
- ✅ P101 `current_contract_id` = null

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

### Step 7.4: Verify Dashboard After Termination
**Actions:**
1. Vào Dashboard

**Expected:**
- ✅ Phòng đang thuê: **1** (chỉ còn P202)
- ✅ Phòng trống: **4**

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Phase 8: Monthly Billing Cycle (Preparation)

### Step 8.1: View Billing Page
**Actions:**
1. Click "Hóa đơn" trong bottom nav

**Expected:**
- ✅ List rooms có active contracts
- ✅ Hiển thị P202 (vì còn active contract)
- ✅ Có option để "Ghi chỉ số điện nước"

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________
- [ ] N/A (Chưa implement)

---

### Step 8.2: Mock Meter Reading Entry
**Actions:**
1. Click vào P202
2. Nhập manually (vì OCR chưa có):
   - Điện cũ: `100`
   - Điện mới: `150`
   - Nước cũ: `20`
   - Nước mới: `25`
3. Lưu

**Expected:**
- ✅ Meter reading saved
- ✅ Calculations:
   - Electric used: 50 kWh
   - Water used: 5 m³

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________
- [ ] N/A (Chưa implement)

---

### Step 8.3: View Invoice (if auto-generated)
**Actions:**
1. Check if invoice auto-generated

**Expected:**
- ✅ Invoice cho P202 tháng 09/2026
- ✅ Breakdown:
   - Tiền phòng: 4,000,000
   - Tiền điện: 50 × (giá điện)
   - Tiền nước: 5 × (giá nước)
   - Tổng cộng: (calculated)

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________
- [ ] N/A (Chưa implement)

---

## Final Database Verification

### Step 9.1: Check Database Consistency
**Actions:**
Run SQL queries để verify data integrity:

```sql
-- Count rooms
SELECT status, COUNT(*) FROM rooms GROUP BY status;

-- Count tenants
SELECT COUNT(*) FROM tenants WHERE status = 'ACTIVE';

-- Count contracts
SELECT status, COUNT(*) FROM contracts GROUP BY status;

-- Verify room-contract linkage
SELECT r.room_code, r.status, c.id as contract_id
FROM rooms r
LEFT JOIN contracts c ON r.current_contract_id = c.id;
```

**Expected:**
```
Rooms:
- AVAILABLE: 4
- OCCUPIED: 1
- TOTAL: 5

Tenants (ACTIVE): 3

Contracts:
- ACTIVE: 1
- TERMINATED: 1

Room-Contract:
- P101: AVAILABLE, null
- P102: AVAILABLE, null
- P201: AVAILABLE, null
- P202: OCCUPIED, <contract_id>
- P203: AVAILABLE, null
```

**Actual:**
- [ ] Pass
- [ ] Fail: ____________________

---

## Summary

| Phase | Status | Notes |
|---|---|---|
| 1. Onboarding | ⬜ | |
| 2. Create Property | ⬜ | |
| 3. Create 5 Rooms | ⬜ | |
| 4. Register 3 Tenants | ⬜ | |
| 5. Create 2 Contracts | ⬜ | |
| 6. Dashboard Check | ⬜ | |
| 7. Updates & Termination | ⬜ | |
| 8. Billing Prep | ⬜ | |
| 9. DB Verification | ⬜ | |

**Overall Journey Status:** ⬜ Not Started / 🔄 In Progress / ✅ Passed / ❌ Failed

---

## Critical Bugs Found

| Bug ID | Phase | Description | Severity | Status |
|---|---|---|---|---|
| - | - | - | - | - |

---

## Performance Notes
- Page load times: ____________________
- API response times: ____________________
- UI responsiveness: ____________________

---

## Mobile Responsiveness
- [ ] Tested on mobile viewport
- [ ] Bottom navigation works
- [ ] Forms usable on mobile
- [ ] Touch targets adequate

---

## Test Completion
- Tested by: ________________
- Date: ________________
- Duration: ________________
- Browser: ________________
