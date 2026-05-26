# Nhà Trọ Cô Thái Web App

```txt
src/
│
├── app/
│   ├── App.jsx
│   ├── main.jsx
│   ├── providers/
│   ├── routes/
│   └── layouts/
│
├── modules/
│   │
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── AuthGuard.jsx
│   │   │   └── RoleGuard.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useLogin.js
│   │   │
│   │   ├── services/
│   │   │   └── auth.service.js
│   │   │
│   │   ├── store/
│   │   │   └── auth.store.js
│   │   │
│   │   ├── validators/
│   │   │   └── auth.validator.js
│   │   │
│   │   ├── constants/
│   │   │   └── auth-role.js
│   │   │
│   │   └── utils/
│   │       └── auth.util.js
│   │
│   ├── room/
│   │   ├── pages/
│   │   │   ├── RoomListPage.jsx
│   │   │   ├── RoomDetailPage.jsx
│   │   │   └── RoomFormPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── RoomTable.jsx
│   │   │   ├── RoomCard.jsx
│   │   │   ├── RoomForm.jsx
│   │   │   ├── RoomFilter.jsx
│   │   │   └── RoomStatusBadge.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useRooms.js
│   │   │   ├── useRoomDetail.js
│   │   │   └── useRoomForm.js
│   │   │
│   │   ├── services/
│   │   │   └── room.service.js
│   │   │
│   │   ├── store/
│   │   │   └── room.store.js
│   │   │
│   │   ├── validators/
│   │   │   └── room.validator.js
│   │   │
│   │   ├── constants/
│   │   │   └── room-status.js
│   │   │
│   │   └── utils/
│   │       └── room.util.js
│   │
│   ├── tenant/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── contract/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── invoice/
│   │   ├── pages/
│   │   ├── components/
│   │   │   ├── InvoiceTable.jsx
│   │   │   ├── InvoiceCard.jsx
│   │   │   ├── InvoiceSummary.jsx
│   │   │   ├── InvoiceStatusBadge.jsx
│   │   │   └── InvoiceShareButton.jsx
│   │   │
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── validators/
│   │   ├── constants/
│   │   └── utils/
│   │
│   ├── payment/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   │
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── RevenueChart.jsx
│   │   │   ├── OccupancyChart.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── RecentInvoices.jsx
│   │   │
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── meter-reading/
│   │   ├── pages/
│   │   │   ├── MeterReadingPage.jsx
│   │   │   └── OCRReviewPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── CameraCapture.jsx
│   │   │   ├── OCRPreview.jsx
│   │   │   ├── OCRResultForm.jsx
│   │   │   ├── MeterReadingTable.jsx
│   │   │   └── OCRGuideOverlay.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useOCR.js
│   │   │   ├── useCamera.js
│   │   │   └── useMeterReading.js
│   │   │
│   │   ├── services/
│   │   │   ├── ocr.service.js
│   │   │   ├── image-processing.service.js
│   │   │   └── meter-reading.service.js
│   │   │
│   │   ├── workers/
│   │   │   └── ocr.worker.js
│   │   │
│   │   ├── utils/
│   │   │   ├── image.util.js
│   │   │   ├── ocr.util.js
│   │   │   └── validation.util.js
│   │   │
│   │   ├── validators/
│   │   │   └── ocr.validator.js
│   │   │
│   │   └── constants/
│   │       └── ocr.constants.js
│   │
│   └── notification/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── utils/
│
├── shared/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Drawer.jsx
│   │   │   └── Badge.jsx
│   │   │
│   │   ├── form/
│   │   ├── table/
│   │   ├── modal/
│   │   ├── chart/
│   │   └── loading/
│   │
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   ├── useOffline.js
│   │   └── useLocalStorage.js
│   │
│   ├── services/
│   │   ├── firebase.service.js
│   │   ├── storage.service.js
│   │   └── upload.service.js
│   │
│   ├── utils/
│   │   ├── currency.js
│   │   ├── date.js
│   │   ├── number.js
│   │   ├── image.js
│   │   └── firebase-error.js
│   │
│   ├── constants/
│   │   ├── routes.js
│   │   ├── app.js
│   │   ├── regex.js
│   │   └── storage-path.js
│   │
│   └── validators/
│       └── common.validator.js
│
├── firebase/
│   ├── config.js
│   ├── firestore.js
│   ├── auth.js
│   ├── storage.js
│   ├── rules/
│   └── indexes/
│
├── offline/
│   ├── service-worker.js
│   ├── sync-queue.js
│   ├── workbox.js
│   └── cache.js
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── styles/
│
└── index.css
```

---

# Ý nghĩa kiến trúc này

## `modules/`

Đây là trái tim của project.

Mỗi folder:

```txt
room/
invoice/
tenant/
```

= 1 business domain độc lập.

---

# Ví dụ room module

```txt
room/
 ├── pages/
 ├── components/
 ├── hooks/
 ├── services/
 ├── store/
 ├── validators/
 └── utils/
```

=> Toàn bộ logic room nằm trong đây.

---

# `shared/`

Chứa reusable code toàn app.

Ví dụ:

```txt
Button
Modal
Input
useDebounce
formatCurrency
```

Nếu nhiều module cùng dùng → để shared.

---

# `app/`

Chứa:

- App root
- router
- providers
- layouts

Ví dụ:

```txt
Router
ThemeProvider
AuthProvider
```

---

# `firebase/`

Setup Firebase riêng biệt.

Ví dụ:

```txt
config
firestore
storage
auth
```

---

# `offline/`

Logic PWA/offline-first.

Ví dụ:

```txt
service worker
cache
offline sync
```

---

# Flow thực tế

```txt
Route
 ↓
Module Page
 ↓
Module Components
 ↓
Hooks
 ↓
Services
 ↓
Firebase
```

---

# OCR flow

```txt
CameraCapture
      ↓
image-processing.service
      ↓
ocr.worker
      ↓
Tesseract.js
      ↓
OCRResultForm
      ↓
Firestore
```

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
