# Test Cases Overview — NhaTroCoThai

## Mục tiêu Testing

Testing toàn bộ flow của ứng dụng NhaTroCoThai từ khi Owner onboarding cho đến việc quản lý hợp đồng, tenant, và hóa đơn hàng tháng.

## Test Environment

- **URL:** http://localhost:5174
- **Database:** Supabase PostgreSQL
- **Test Data:** Sẽ tạo data thật trong quá trình test

## Test User

| Role | Phone | Email | Password |
|---|---|---|---|
| OWNER | 0901234567 | 0901234567@nhatrocothai.vn | owner123 |

## Test Scenarios

### 1. Authentication Flow
**File:** `01-authentication-test.md`
- [ ] Login với số điện thoại
- [ ] Test "Ghi nhớ đăng nhập" (rememberMe)
- [ ] Logout
- [ ] Session persistence (đóng/mở browser)

### 2. Owner Onboarding Flow
**File:** `02-owner-onboarding-test.md`
- [ ] Owner lần đầu đăng nhập
- [ ] Tạo Property đầu tiên
- [ ] Thêm nhiều Room vào Property
- [ ] Verify data trong database

### 3. Room Management (CRUD)
**File:** `03-room-management-test.md`
- [ ] List all rooms
- [ ] Filter rooms by status (AVAILABLE, OCCUPIED, MAINTENANCE)
- [ ] Create new room
- [ ] Update room information
- [ ] Update room price → Check price history
- [ ] Soft delete room (ARCHIVED)

### 4. Tenant Management (CRUD)
**File:** `04-tenant-management-test.md`
- [ ] List all tenants
- [ ] Filter tenants by status
- [ ] Create new tenant (without ID images first)
- [ ] Update tenant information
- [ ] Upload citizen ID images (front/back) → Supabase Storage
- [ ] Soft delete tenant (MOVED_OUT)

### 5. Contract Management (CRUD)
**File:** `05-contract-management-test.md`
- [ ] List all contracts
- [ ] Filter contracts by status
- [ ] Create contract (link room + tenant)
- [ ] Verify room status changes to OCCUPIED
- [ ] Add multiple tenants to contract
- [ ] Update contract information
- [ ] Terminate contract → Verify room becomes AVAILABLE

### 6. Full Owner Journey
**File:** `06-full-owner-journey.md`
- [ ] Owner creates property
- [ ] Owner adds 5 rooms
- [ ] Owner registers 3 tenants
- [ ] Owner creates 2 contracts
- [ ] Owner views dashboard statistics
- [ ] Expected: 2 occupied rooms, 3 available rooms

### 7. Monthly Billing Cycle (Preparation for OCR)
**File:** `07-billing-cycle-test.md`
- [ ] View rooms with active contracts
- [ ] Mock meter reading entry (manual input for now)
- [ ] Verify invoice generation logic (if implemented)
- [ ] Check invoice calculations

### 8. Properties Module Test
**File:** `08-properties-test.md`
- [ ] Create property
- [ ] List properties
- [ ] Update property information
- [ ] Verify room count auto-calculation

## Test Data Structure

### Test Property
```json
{
  "name": "Nhà Trọ Cô Thái - Chi Nhánh Test",
  "address": "123 Đường Test, Quận 1, TP.HCM",
  "roomCount": 5,
  "status": "ACTIVE"
}
```

### Test Rooms
```json
[
  { "roomCode": "P101", "floor": "1", "area": 20, "currentPrice": 3000000, "status": "AVAILABLE" },
  { "roomCode": "P102", "floor": "1", "area": 25, "currentPrice": 3500000, "status": "AVAILABLE" },
  { "roomCode": "P201", "floor": "2", "area": 20, "currentPrice": 3000000, "status": "AVAILABLE" },
  { "roomCode": "P202", "floor": "2", "area": 30, "currentPrice": 4000000, "status": "AVAILABLE" },
  { "roomCode": "P203", "floor": "2", "area": 25, "currentPrice": 3500000, "status": "AVAILABLE" }
]
```

### Test Tenants
```json
[
  {
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678",
    "citizenId": "001234567890",
    "birthDate": "1995-03-15",
    "permanentAddress": "456 Đường ABC, Quận 2, TP.HCM"
  },
  {
    "fullName": "Trần Thị B",
    "phone": "0923456789",
    "citizenId": "001234567891",
    "birthDate": "1997-07-20",
    "permanentAddress": "789 Đường XYZ, Quận 3, TP.HCM"
  },
  {
    "fullName": "Lê Văn C",
    "phone": "0934567890",
    "citizenId": "001234567892",
    "birthDate": "1993-11-05",
    "permanentAddress": "321 Đường DEF, Quận 4, TP.HCM"
  }
]
```

### Test Contracts
```json
[
  {
    "roomCode": "P101",
    "representativeTenantName": "Nguyễn Văn A",
    "depositAmount": 6000000,
    "monthlyRent": 3000000,
    "billingDay": 5,
    "startDate": "2026-09-01"
  },
  {
    "roomCode": "P202",
    "representativeTenantName": "Trần Thị B",
    "tenants": ["Trần Thị B", "Lê Văn C"],
    "depositAmount": 8000000,
    "monthlyRent": 4000000,
    "billingDay": 10,
    "startDate": "2026-09-01"
  }
]
```

## Expected Outcomes After Full Test

| Metric | Expected Value |
|---|---|
| Properties | 1 |
| Total Rooms | 5 |
| Available Rooms | 3 |
| Occupied Rooms | 2 |
| Tenants | 3 |
| Active Contracts | 2 |
| Terminated Contracts | 0 |

## Bug Tracking

| Bug ID | Module | Description | Status | Fixed Date |
|---|---|---|---|---|
| - | - | - | - | - |

## Test Execution Log

| Date | Tester | Scenarios Tested | Pass/Fail | Notes |
|---|---|---|---|---|
| 2026-09-19 | Kiro AI | All | TBD | Initial test run |

---

## Notes
- Tất cả test cases sử dụng **manual testing** qua UI
- Automation tests (Playwright/Cypress) sẽ được thêm trong Phase 2
- Mỗi test scenario có checklist rõ ràng
- Screenshots được khuyến khích để document bugs
