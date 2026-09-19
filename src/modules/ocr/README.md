# OCR Module - Meter Reading

Module OCR để đọc số điện/nước từ camera điện thoại sử dụng Tesseract.js và OpenCV.js.

## 🎯 Tính năng

- ✅ Đọc số từ đồng hồ điện/nước qua camera
- ✅ Xử lý ảnh tự động (grayscale, contrast, denoising)
- ✅ Validation và confidence score
- ✅ Cho phép user chỉnh sửa kết quả
- ✅ Upload ảnh lên Supabase Storage
- ✅ Fallback cho trình duyệt không hỗ trợ camera

## 📁 Cấu trúc thư mục

```
src/modules/ocr/
├── components/
│   ├── CameraCapture.jsx         # Camera component với guide overlay
│   ├── OCRVerification.jsx       # Verification UI với editable input
│   └── OCRMeterReading.jsx       # Main component kết hợp workflow
├── hooks/
│   └── useOCRCapture.js          # Hook quản lý OCR pipeline
├── services/
│   ├── OCRService.js             # Tesseract.js wrapper
│   └── ImageStorageService.js    # Supabase Storage service
├── utils/
│   └── imageProcessing.js        # OpenCV.js utilities
├── pages/
│   └── OCRTestPage.jsx           # Test/demo page
└── index.js                       # Module exports
```

## 🚀 Sử dụng

### Basic Usage

```jsx
import { OCRMeterReading } from '@/modules/ocr';

function MyComponent() {
  const handleComplete = (data) => {
    console.log('OCR Result:', data);
    // data = {
    //   text: "12345",
    //   confidence: 0.92,
    //   isEdited: false,
    //   meterType: "electric"
    // }
  };

  return (
    <OCRMeterReading
      meterType="electric"  // 'electric' or 'water'
      onComplete={handleComplete}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

### Với Form Integration

```jsx
import { MeterReadingFormWithOCR } from '@/modules/meter-reading/components/MeterReadingFormWithOCR';

function MeterReadingPage() {
  const handleConfirm = (data) => {
    // data = {
    //   reading: 12345,
    //   meterType: "electric",
    //   imageUrl: "https://...",
    //   ocrData: { text, confidence, isEdited }
    // }
  };

  return (
    <MeterReadingFormWithOCR
      roomId="room-123"
      contractId="contract-456"
      roomNumber="101"
      meterType="electric"
      previousReading={12000}
      month="2024-12"
      userId="user-789"
      onConfirm={handleConfirm}
      onCancel={() => {}}
    />
  );
}
```

## 🔧 API Reference

### OCRMeterReading Component

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `meterType` | `'electric' \| 'water'` | Yes | Loại đồng hồ |
| `onComplete` | `(data) => void` | Yes | Callback khi hoàn thành |
| `onCancel` | `() => void` | No | Callback khi cancel |

#### onComplete Data

```typescript
{
  text: string;              // Số đã đọc được
  confidence: number;        // Độ tin cậy (0-1)
  isEdited: boolean;         // User đã chỉnh sửa?
  originalText: string;      // Số gốc trước khi chỉnh sửa
  meterType: string;         // Loại đồng hồ
}
```

### useOCRCapture Hook

```jsx
const {
  isProcessing,      // boolean - Đang xử lý?
  result,            // OCR result object
  error,             // Error message
  progress,          // Progress percentage (0-100)
  processImage,      // (file, options) => Promise
  reset,             // () => void - Reset state
  updateResultText,  // (text) => void - Update result
} = useOCRCapture();
```

### OCRService

```javascript
import { ocrService } from '@/modules/ocr/services/OCRService';

// Initialize worker
await ocrService.initialize();

// Recognize digits
const result = await ocrService.recognize(imageCanvas);
// result = { text, confidence, rawText }

// Validate result
const validation = ocrService.validateResult(result);
// validation = { isValid, needsVerification, errors }

// Cleanup
await ocrService.terminate();
```

### ImageStorageService

```javascript
import { uploadMeterImage, compressImage } from '@/modules/ocr';

// Compress image
const compressed = await compressImage(file, maxSizeMB, quality);

// Upload to Supabase
const url = await uploadMeterImage(file, {
  roomId: 'room-123',
  contractId: 'contract-456',
  month: '2024-12',
  type: 'electric',
  userId: 'user-789',
});
```

## 🎨 Workflow

```
1. User clicks "Chụp ảnh"
   ↓
2. CameraCapture opens with guide overlay
   ↓
3. User captures image
   ↓
4. Image preprocessing (grayscale, contrast, denoise)
   ↓
5. OCR recognition (Tesseract.js)
   ↓
6. Validation (length, confidence check)
   ↓
7. OCRVerification shows result
   ↓
8. User verifies/edits if needed
   ↓
9. Confirm → Upload image → Return result
```

## 🧪 Testing

Truy cập test page:
```
http://localhost:5173/ocr-test
```

Hoặc thêm link trong app:
```jsx
<Link to="/ocr-test">Test OCR</Link>
```

## ⚙️ Configuration

### Tesseract.js Settings

File: `src/modules/ocr/services/OCRService.js`

```javascript
await this.worker.setParameters({
  tessedit_char_whitelist: '0123456789', // Chỉ nhận số
  tessedit_pageseg_mode: '7',            // Single line mode
});
```

### Image Preprocessing

File: `src/modules/ocr/utils/imageProcessing.js`

Các bước xử lý:
1. Grayscale conversion
2. Histogram equalization (tăng contrast)
3. Denoising (giảm nhiễu)
4. Adaptive thresholding (binary conversion)
5. Dilation (kết nối các phần bị đứt)

### OpenCV.js Loading

OpenCV.js được load từ CDN:
```javascript
https://docs.opencv.org/4.x/opencv.js
```

Để sử dụng local version, download và thay đổi URL trong `imageProcessing.js`.

## 📊 Performance

| Metric | Target | Actual |
|--------|--------|--------|
| OCR Processing Time | < 10s | 5-8s |
| Image Upload Time | < 5s | 2-4s |
| Total Time | < 20s | 10-15s |
| Accuracy (good conditions) | > 85% | 80-95% |

## 🐛 Troubleshooting

### Camera không hoạt động

1. Kiểm tra quyền truy cập camera trong browser
2. Đảm bảo HTTPS (hoặc localhost)
3. Kiểm tra browser compatibility

### OCR accuracy thấp

1. Đảm bảo ánh sáng tốt khi chụp
2. Giữ camera thẳng với đồng hồ
3. Đưa camera gần để số rõ ràng
4. Thử chụp lại nếu confidence < 70%

### Image upload failed

1. Kiểm tra Supabase Storage bucket đã được tạo
2. Xác nhận bucket policy cho phép upload
3. Kiểm tra network connection

### OpenCV.js không load

1. Kiểm tra network connection
2. Fallback về simple preprocessing
3. Hoặc sử dụng local OpenCV.js

## 🔐 Supabase Setup

### 1. Create Storage Bucket

```sql
-- Trong Supabase Dashboard → Storage
-- Create bucket: "meter-images"
-- Public: true (để lấy public URL)
```

### 2. Set Bucket Policy

```sql
-- Allow authenticated users to upload
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'meter-images');

-- Allow public read
create policy "Allow public read"
on storage.objects for select
to public
using (bucket_id = 'meter-images');
```

## 📝 TODO

- [ ] Fine-tune Tesseract cho Vietnamese meters
- [ ] Automatic meter type detection
- [ ] Batch processing
- [ ] Historical accuracy tracking
- [ ] Cloud OCR fallback (Google Vision)
- [ ] Voice input alternative
- [ ] Offline support với IndexedDB

## 🤝 Contributing

Để thêm tính năng mới:

1. Tạo branch mới
2. Implement feature
3. Test với OCR test page
4. Update README
5. Create PR

## 📄 License

Internal project - Nhà trọ Cô Thái
