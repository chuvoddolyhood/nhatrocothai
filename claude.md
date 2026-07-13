# NhaTroCoThai — Project Context for AI Assistants

> **Purpose:** This file provides comprehensive context for AI coding assistants (Claude, Gemini, etc.) working on the NhaTroCoThai rental management web application. Read this file before making any code changes.

---

## Project Overview

**NhaTroCoThai** is a Vietnamese boarding-house / rental property management web app designed for landlords and property managers. Key goals:

- Manage rooms, tenants, and rental contracts.
- Capture utility meter readings (electricity & water) via mobile camera + OCR.
- Auto-calculate and generate monthly invoices.
- Provide a dashboard with revenue and occupancy analytics.
- Work on mobile browsers as a Progressive Web App (PWA).

---

# Architecture

## 1. Overall Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite (SPA, mobile-first, PWA) |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Image Storage** | Supabase Storage |
| **Database** | Supabase PostgreSQL (see schema below) |
| **OCR** | Tesseract.js + OpenCV.js (client-side), optional server-side fallback |
| **Deployment** | Firebase Hosting |

### Key Directories

```
src/
├── modules/
│   ├── contract/          # Contract CRUD + services
│   ├── dashboard/         # Analytics dashboard
│   ├── demo/              # Demo/sandbox pages
│   ├── invoice/           # Invoice generation & viewing
│   ├── meter-reading/     # OCR capture workflow
│   ├── properties/        # Property management
│   ├── room/              # Room CRUD
│   └── tenant/            # Tenant CRUD
├── shared/                # Shared components, hooks, utilities
├── supabase/              # Supabase client config
├── firebase/              # Firebase config (Auth)
└── utils/                 # Helper functions
```

---

## 2. Database Schema (Supabase PostgreSQL)

> Full migration script: [`supabase_migration.sql`](./supabase_migration.sql)
> Row Level Security (RLS) is **enabled** on all tables. Currently using an open policy (`USING (true)`) — tighten per-role when Auth is integrated.

### Table Summary

| # | Table | Description |
|---|---|---|
| 1 | `users` | App users (admin, staff, owner, tenant) |
| 2 | `properties` | Rental properties / khu trọ |
| 3 | `property_users` | Many-to-many: users ↔ properties |
| 4 | `rooms` | Individual rental rooms |
| 5 | `tenants` | Tenant personal info + ID documents |
| 6 | `contracts` | Rental contracts (room ↔ tenant) |
| 7 | `contract_tenants` | Many-to-many: contracts ↔ tenants |
| 8 | `room_prices` | Room price history (effective date ranges) |
| 9 | `utility_prices` | Electricity/water/internet/service price history per property |
| 10 | `meter_readings` | Monthly electric & water meter readings + OCR metadata |
| 11 | `invoices` | Monthly invoices with itemized fees |
| 12 | `invoice_tenants` | Many-to-many: invoices ↔ tenants |
| 13 | `payments` | Payment records linked to invoices |
| 14 | `monthly_reports` | Aggregated monthly revenue reports per property |
| 15 | `notifications` | In-app notifications per user |
| 16 | `audit_logs` | Entity change log (old/new JSON values) |

### Detailed Schema

#### `users`
```sql
id            bigint IDENTITY PK
full_name     varchar NOT NULL
email         varchar UNIQUE
phone         varchar
role          varchar NOT NULL          -- 'ADMIN' | 'STAFF' | 'OWNER' | 'TENANT'
status        varchar DEFAULT 'ACTIVE'
created_at    timestamptz
updated_at    timestamptz
```

#### `properties`
```sql
id                    bigint IDENTITY PK
owner_id              bigint → users(id)
name                  varchar NOT NULL
address               text
room_count            integer DEFAULT 0
occupied_room_count   integer DEFAULT 0
status                varchar DEFAULT 'ACTIVE'
created_at / updated_at
```

#### `property_users` *(junction)*
```sql
property_id  bigint → properties(id)
user_id      bigint → users(id)
PK (property_id, user_id)
```

#### `rooms`
```sql
id                   bigint IDENTITY PK
property_id          bigint → properties(id)
room_code            varchar NOT NULL         -- e.g. "P101"
floor                varchar
area                 numeric                  -- m²
status               varchar NOT NULL         -- 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
current_contract_id  bigint                   -- denormalized for quick lookup
current_price        numeric NOT NULL
created_at / updated_at
created_by / updated_by → users(id)
```

#### `tenants`
```sql
id                    bigint IDENTITY PK
full_name             varchar NOT NULL
phone                 varchar NOT NULL
citizen_id            varchar NOT NULL         -- CCCD / CMND
birth_date            date NOT NULL
permanent_address     text NOT NULL
citizen_id_front_url  text                     -- Supabase Storage URL
citizen_id_back_url   text                     -- Supabase Storage URL
status                varchar DEFAULT 'ACTIVE'
created_at / updated_at
created_by / updated_by → users(id)
```

#### `contracts`
```sql
id                        bigint IDENTITY PK
property_id               bigint → properties(id)
room_id                   bigint → rooms(id)
representative_tenant_id  bigint → tenants(id)
deposit_amount            numeric NOT NULL
monthly_rent              numeric NOT NULL
billing_day               integer NOT NULL      -- day of month (1–28)
start_date                date NOT NULL
end_date                  date                  -- NULL = open-ended
status                    varchar               -- 'ACTIVE' | 'TERMINATED' | 'EXPIRED'
created_at / updated_at
created_by / updated_by → users(id)
```

#### `contract_tenants` *(junction)*
```sql
contract_id  bigint → contracts(id)
tenant_id    bigint → tenants(id)
PK (contract_id, tenant_id)
```

#### `room_prices`
```sql
id              bigint IDENTITY PK
room_id         bigint → rooms(id)
price           numeric NOT NULL
effective_from  date NOT NULL
effective_to    date          -- NULL = currently active
created_at / updated_at
created_by / updated_by → users(id)
```

#### `utility_prices`
```sql
id              bigint IDENTITY PK
property_id     bigint → properties(id)
electric_price  numeric NOT NULL    -- VND per kWh
water_price     numeric NOT NULL    -- VND per m³
internet_price  numeric DEFAULT 0
service_price   numeric DEFAULT 0
effective_from  date NOT NULL
effective_to    date
created_at
```

#### `meter_readings`
```sql
id                       bigint IDENTITY PK
room_id                  bigint → rooms(id)
contract_id              bigint → contracts(id)
month                    varchar NOT NULL           -- 'YYYY-MM'
electric_old             integer NOT NULL
electric_new             integer NOT NULL
electric_used            integer NOT NULL           -- computed: new - old
water_old                integer NOT NULL
water_new                integer NOT NULL
water_used               integer NOT NULL           -- computed: new - old
electric_image_url       text                       -- Supabase Storage
water_image_url          text                       -- Supabase Storage
electric_ocr_text        varchar                    -- raw OCR string
water_ocr_text           varchar
electric_ocr_confidence  numeric                    -- 0.0 – 1.0
water_ocr_confidence     numeric
verified                 boolean DEFAULT false
verified_by              bigint → users(id)
created_at
```

#### `invoices`
```sql
id                         bigint IDENTITY PK
property_id / room_id / contract_id → FK
month                      varchar NOT NULL           -- 'YYYY-MM'
room_fee                   numeric NOT NULL
electric_price             numeric NOT NULL
electric_usage             integer NOT NULL
electric_fee               numeric NOT NULL
water_price                numeric NOT NULL
water_usage                integer NOT NULL
water_fee                  numeric NOT NULL
internet_fee               numeric DEFAULT 0
service_fee                numeric DEFAULT 0
other_fees                 jsonb                      -- ad-hoc extra charges
discount                   numeric DEFAULT 0
total_amount               numeric NOT NULL
room_code                  varchar                    -- denormalized snapshot
representative_tenant_name varchar                    -- denormalized snapshot
status                     varchar DEFAULT 'UNPAID'   -- 'UNPAID' | 'PAID' | 'OVERDUE'
due_date                   date
paid_at                    timestamptz
created_at
```

**Invoice Formula:**
```
total_amount = room_fee
             + (electric_usage × electric_price)
             + (water_usage × water_price)
             + internet_fee
             + service_fee
             + SUM(other_fees)
             - discount
```

#### `invoice_tenants` *(junction)*
```sql
invoice_id  bigint → invoices(id)
tenant_id   bigint → tenants(id)
PK (invoice_id, tenant_id)
```

#### `payments`
```sql
id               bigint IDENTITY PK
invoice_id       bigint → invoices(id)
room_id          bigint → rooms(id)
amount           numeric NOT NULL
payment_method   varchar          -- 'CASH' | 'BANK_TRANSFER' | 'MOMO' etc.
transaction_code varchar
paid_by          bigint → users(id)
paid_at          timestamptz NOT NULL
note             text
created_at
```

#### `monthly_reports`
```sql
id                   bigint IDENTITY PK
property_id          bigint → properties(id)
month                varchar NOT NULL       -- 'YYYY-MM'
total_revenue        numeric
unpaid_amount        numeric
occupied_rooms       integer
total_rooms          integer
occupancy_rate       numeric                -- percentage
electric_consumption integer
water_consumption    integer
generated_at         timestamptz
```

#### `notifications`
```sql
id              bigint IDENTITY PK
type            varchar                 -- 'INVOICE_DUE' | 'PAYMENT_RECEIVED' etc.
target_user_id  bigint → users(id)
title           varchar
message         text
is_read         boolean DEFAULT false
created_at
```

#### `audit_logs`
```sql
id            bigint IDENTITY PK
entity_type   varchar NOT NULL          -- 'rooms' | 'contracts' | 'invoices' etc.
entity_id     bigint NOT NULL
action        varchar NOT NULL          -- 'CREATE' | 'UPDATE' | 'DELETE'
old_value     jsonb
new_value     jsonb
performed_by  bigint → users(id)
performed_at  timestamptz
```

---

## 3. Core Features

### Security Module

#### Authentication & Authorization
- Role-based access control (RBAC):
  - `ADMIN` — full system access
  - `STAFF` — manage rooms, tenants, invoices under assigned properties
  - `OWNER` — manage their own properties only
  - `TENANT` — view-only access to their own invoices

#### PWA Offline Support
- Cache core application pages via Workbox service worker.
- Allow users to enter data while offline (IndexedDB queue).
- Automatically sync data when device reconnects.

---

### Management Module

#### Room Management
- Create / update / delete rooms.
- Room statuses: `AVAILABLE` | `OCCUPIED` | `MAINTENANCE`
- Track rental price and security deposit per contract.
- Price history stored in `room_prices` (effective date ranges).

#### Tenant Management
Maintain tenant profile:
- Full name, phone, citizen ID (`citizen_id`)
- Birth date, permanent address
- ID document photos (front/back) stored in Supabase Storage

#### Contract Management
- Link one room to one or more tenants via `contract_tenants`.
- Set deposit, monthly rent, billing day, start/end dates.
- Contract statuses: `ACTIVE` | `TERMINATED` | `EXPIRED`

---

### Billing & Utility OCR Module

#### Mobile Camera Capture
```html
<input type="file" accept="image/*" capture="environment">
```
Opens rear camera on mobile for meter photos.

#### Image Pre-processing (OpenCV.js)
Before OCR:
1. Convert to grayscale
2. Increase contrast
3. Crop meter display area
4. Correct rotation
5. Resize for OCR performance
6. Apply adaptive thresholding

#### OCR Recognition (Tesseract.js)
- Digit-only whitelist: `0123456789`
- Result displayed in editable input field
- User verifies / corrects before saving

#### OCR Data Stored in `meter_readings`
| Field | Description |
|---|---|
| `electric_ocr_text` / `water_ocr_text` | Raw OCR string |
| `electric_ocr_confidence` / `water_ocr_confidence` | Confidence score 0–1 |
| `electric_image_url` / `water_image_url` | Supabase Storage URL |
| `verified` | Whether owner confirmed the value |
| `verified_by` | `users.id` of confirming user |

#### OCR Validation Rules
- New reading ≥ previous reading
- Numeric regex validation
- Reasonable consumption range check
- Require user confirmation before save

#### OCR Fallback
If confidence is low → upload image to server → optional Cloud OCR integration.

#### Bill Calculation
```
(electric_new - electric_old) × electric_price
+ (water_new - water_old) × water_price
+ monthly_rent
+ internet_fee + service_fee + other_fees
- discount
= total_amount
```

#### Invoice Sharing
- Share via **Zalo**, **SMS**
- Plain text or image link format

---

### Reports & Analytics Module

#### Dashboard
- Paid rooms count this month
- Overdue rooms count
- Expected monthly revenue
- Occupancy rate

#### Billing History
- Historical invoices per room
- Monthly utility usage trends

---

### Advanced Features (Future Phases)
- Automatic payment reminders (Email / SMS / Zalo)
- Maintenance ticket management
- Advanced reporting (CSV export, charts)
- Enhanced OCR (custom ML models, cloud OCR)
- Multi-property management

---

## 4. Mobile Web OCR Workflow

```
Step 1: Camera Capture
  └─ <input type="file" accept="image/*" capture="environment">

Step 2: Image Pre-processing (Canvas + OpenCV.js)
  └─ Grayscale → Contrast → Crop → Rotate → Resize → Threshold

Step 3: OCR (Tesseract.js)
  └─ Whitelist: 0123456789 → extract number

Step 4: User Verification
  └─ Show result in editable field → confirm → save

Step 5: Save to Supabase
  └─ meter_readings row + image in Supabase Storage
```

### UX Tips for OCR
- Show overlay guide to align meter in frame
- Recommend good lighting
- Suggest holding phone straight

---

## 5. Security & Operations

### Authentication
- Firebase Authentication **or** custom JWT login.

### Authorization
- RBAC enforced at both UI and Supabase RLS policy level.

### Storage Security
- Configure Supabase Storage bucket access rules.
- Auto-delete temporary images after N days.

### Data Privacy
- Enforce HTTPS everywhere.
- Don't retain sensitive images beyond necessity.

### Rate Limiting
- If backend OCR API is used, apply rate limiting to prevent abuse.

### Backup
- Schedule regular Supabase database exports.
- Store backup snapshots securely.

---

## 6. MVP Implementation Checklist

| Phase | Task | Status |
|---|---|---|
| 1 | Set up Vite + React + Tailwind CSS | ✅ Done |
| 2 | Configure PWA (manifest + Workbox service worker) | ⬜ |
| 3 | Implement authentication (Firebase Auth / JWT) | ⬜ |
| 4 | Create Supabase database schema | ✅ Done (`supabase_migration.sql`) |
| 5 | Build CRUD: Rooms, Tenants, Contracts | 🔄 In Progress |
| 6 | Mobile camera component + alignment overlay | ⬜ |
| 7 | Integrate OpenCV.js + Tesseract.js + OCR confirmation UI | ⬜ |
| 8 | Store images & OCR metadata in Supabase | ⬜ |
| 9 | Dashboard with basic analytics | ⬜ |
| 10 | Deploy: Firebase Hosting (frontend) + Render (backend if needed) | ⬜ |
| 11 | Device testing (Android/iOS), offline sync, OCR validation | ⬜ |

---

## 7. Development Notes for AI Assistants

- **Language:** All UI text is in **Vietnamese**. Keep labels, messages, and comments in Vietnamese unless the codebase uses English for a specific file.
- **Currency:** Vietnamese Đồng (VND). Format numbers with Vietnamese locale (`vi-VN`).
- **Date format:** `DD/MM/YYYY` for display; `YYYY-MM-DD` for DB storage.
- **Month key format:** `'YYYY-MM'` string (e.g. `'2025-07'`) is used as the `month` column across `meter_readings`, `invoices`, and `monthly_reports`.
- **Status enums** are stored as plain `varchar` — no PostgreSQL ENUM type. Always use the string values documented in the schema above.
- **`rooms.current_contract_id`** is a denormalized field for performance. Keep it in sync when creating/terminating contracts.
- **`invoices.room_code`** and **`invoices.representative_tenant_name`** are denormalized snapshots — copied at invoice creation time so historical invoices remain accurate even if room/tenant data changes later.
- **Supabase client** is configured in `src/supabase/`.
- **Firebase config** (Auth/Hosting) is in `src/firebase/`.
- **Module structure** follows feature-based organization under `src/modules/<feature>/`.
- **RLS policies** are currently open (`USING (true)`). When adding Auth, update policies to enforce per-user/per-role access.
