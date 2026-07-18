@"
# OCR & CCCD Detection Implementation Plan

> **Trạng thái**: Ready for Phase 1
> **Cập nhật**: Tháng 7 năm 2026
> **Phạm vi**: 100% FREE - Không chi phí backend

---

## 📋 Tổng quan

Implement OCR (Optical Character Recognition) + CCCD Detection để tự động đọc thông tin thẻ căn cước công dân khi chụp ảnh, giúp auto-fill form "Thêm khách thuê mới".

**3 Phases - 100% Free - No Backend Cost**

---

## 🎯 Phase 1: MVP - ml5.js + Tesseract.js (1-2 tuần)

### Mục tiêu
- Deploy nhanh chóng (quick win)
- Validate flow hoạt động
- Collect data cho training Phase 2

### Technology Stack

\`\`\`
Client-side:
├─ Tesseract.js         (OCR engine - pure JavaScript)
├─ Tesseract.js-core    (Vietnamese language)
├─ ml5.js               (COCO-SSD detection model)
└─ TensorFlow.js        (backend cho ml5.js)

Status:
└─ Tesseract.js đã cài trong package.json
\`\`\`

### Features

**1. Real-time Detection**
\`\`\`
Camera quay → ml5.js detect thẻ CCCD
→ Nếu detect được: Enable "Chụp ảnh"
→ Nếu không detect: Disable "Chụp ảnh"
\`\`\`

**2. OCR Process**
\`\`\`
Chụp mặt trước → Tesseract.js OCR
Chụp mặt sau → Tesseract.js OCR
Extract: fullName, citizenId, birthDate, permanentAddress
\`\`\`

**3. Auto-fill Form**
\`\`\`
Dialog: Hiển thị OCR results
User: Xác nhận/sửa chữ
Submit: Auto-fill vào form
\`\`\`

### Expected Accuracy

| Field | Accuracy |
|-------|----------|
| Số CCCD (0-9) | 95%+ |
| Tên (chữ Việt) | 85-90% |
| Ngày sinh | 90%+ |
| Địa chỉ | 75-85% |
| **Detection (ml5.js)** | **70-80%** |
| **Overall OCR** | **85-90%** |

**Giới hạn Phase 1**:
- Detection: Không trained cho CCCD → detect như document chung
- User có thể retake nếu không detect
- Ảnh chụp xiên/mờ sẽ giảm accuracy

### Performance

\`\`\`
Package Sizes:
├─ Tesseract.js:  ~8MB (gzip 2.5MB) - already in package.json
├─ ml5.js:        ~5MB (gzip 1.5MB)
└─ Total:         ~13MB (load async, không block UI)

Inference Speed:
├─ Detection (ml5.js):        ~30fps realtime
├─ OCR (Tesseract):
│  ├─ First run: 2-3 sec (load model)
│  ├─ Subsequent: 1-2 sec/image
│  └─ Vietnamese: 15MB cached
\`\`\`

### Implementation Checklist

- [ ] Cài \`npm install ml5\`
- [ ] Create \`OcrService.js\` (Tesseract wrapper)
- [ ] Create \`DetectionService.js\` (ml5.js wrapper)
- [ ] Update \`TenantFormDialog.jsx\` - camera detection
- [ ] Create \`OcrResultsDialog.jsx\` - verify + auto-fill
- [ ] Create \`OcrDataLogger.js\` - log predictions
- [ ] Test & validate
- [ ] Deploy

### Files cần tạo/sửa

\`\`\`
src/modules/tenant/
├── services/
│   ├── OcrService.js          (NEW)   - Tesseract wrapper
│   ├── DetectionService.js    (NEW)   - ml5.js wrapper
│   └── OcrDataLogger.js       (NEW)   - Log for training
├── components/
│   ├── TenantFormDialog.jsx   (MODIFY) - Add OCR flow
│   └── OcrResultsDialog.jsx   (NEW)   - Results verification
├── dto/
│   └── OcrResultDTO.js        (NEW)   - Type definitions
└── hooks/
    └── useOcr.js              (NEW)   - Custom hook
\`\`\`

### Acceptance Criteria Phase 1

✅ Detection: 70%+ confidence
✅ OCR: 80%+ field accuracy
✅ User can retake photo
✅ Data logged for training
✅ Auto-fill works correctly

---

## 🚀 Phase 2: Custom YOLO Model (3-6 tháng sau)

### Mục tiêu
- Dùng 500+ ảnh CCCD từ Phase 1 users
- Train custom YOLO model
- Thay ml5.js → Custom YOLO
- Accuracy: 90-95%

### Prerequisites

\`\`\`
Cần có:
├─ 500-1000 ảnh CCCD từ users
├─ Python 3.9+
├─ GPU optional (training nhanh hơn)
└─ Time: ~10-20 hours (annotation + training)
\`\`\`

### Workflow

\`\`\`
Phase 1 Users (collect 500+ images)
    ↓
Annotation Tool (draw boxes around CCCD)
    ↓
YOLOv8 Train
    ↓
Export ONNX format
    ↓
Replace ml5.js → ONNX Runtime.js
    ↓
Deploy Phase 2
\`\`\`

### Training Setup

\`\`\`python
# train.py
from ultralytics import YOLO

model = YOLO('yolov8n.pt')  # Pretrained
results = model.train(
    data='cccd_dataset.yaml',
    epochs=100,
    batch=16,
)
model.export(format='onnx')  # For browser
\`\`\`

### Expected Improvements

\`\`\`
Detection Accuracy:
├─ Phase 1 (ml5.js): 70-80%
└─ Phase 2 (YOLO):   90-95%+

Benefits:
├─ Only detect actual CCCD
├─ Better alignment
└─ Fewer false positives
\`\`\`

### Cost: FREE

\`\`\`
Hardware:
└─ Use Google Colab (free) or your laptop

Software:
├─ YOLOv8 (open source)
├─ PyTorch (open source)
└─ ONNX Runtime (open source)

Time Investment:
├─ Annotation: ~40-50 hours
└─ Training: ~4-8 hours
\`\`\`

---

## 🔮 Phase 3: Backend OCR (Long-term, Optional)

### Mục tiêu
- Move processing to backend
- Accuracy: 95%+
- Async batch processing
- Monitor metrics

### Architecture

\`\`\`
Browser → Send images → Backend
                            ↓
                    YOLOv8: Detect & align
                    Tesseract: OCR
                    NLP: Parse fields
                    DB: Cache results
                            ↓
                    Return JSON ← Browser
\`\`\`

### Technology

\`\`\`
Backend Stack:
├─ Python 3.9+
├─ FastAPI
├─ YOLOv8 (trained from Phase 2)
├─ Tesseract OCR
└─ PostgreSQL caching
\`\`\`

### Backend Example

\`\`\`python
# FastAPI endpoint
@app.post(\"/api/ocr/extract\")
async def extract_cccd(front: UploadFile, back: UploadFile):
    # 1. Load images
    # 2. YOLO detect
    # 3. Tesseract OCR
    # 4. Parse fields
    # 5. Cache in DB
    return {
        \"success\": True,
        \"data\": extracted_data,
        \"confidence\": 0.94
    }
\`\`\`

### Expected Accuracy Phase 3

\`\`\`
Detection: 95%+
OCR: 92-95%
Overall Success: 90%+
\`\`\`

### Cost: FREE (if self-hosted)

\`\`\`
Server Option 1: Render.com
├─ Startup: Free tier
├─ Production: ~\$10-20/month
└─ Easy deploy

Server Option 2: VPS
├─ Linode/DigitalOcean: ~\$5-10/month
└─ More control

Cost: Minimal or free with careful setup
\`\`\`

---

## 📊 Comparison Table

| Aspek | Phase 1 | Phase 2 | Phase 3 |
|-------|---------|---------|---------|
| **Detection** | 70-80% | 90-95% | 95%+ |
| **OCR** | 85-90% | 85-90% | 92-95% |
| **Setup Time** | 1-2 tuần | 1-2 tháng | 2-4 tuần |
| **Cost** | FREE | FREE | FREE-\$20/mo |
| **Data Collection** | Ongoing | Yes (training) | Cached |
| **UX** | Good | Better | Best |
| **Deployment** | Now | Later | Future |

---

## 📈 Recommended FREE Roadmap

\`\`\`
🎯 NGAY (Week 1-2):
└─ Phase 1 Implementation
   ├─ Setup ml5.js + Tesseract.js
   ├─ Detection logic
   ├─ OCR logic
   └─ Data logging

📊 Tháng 2-3:
└─ Phase 1 Production
   ├─ Collect 500+ images
   ├─ Monitor accuracy
   └─ Log user corrections

🤖 Tháng 4-6 (Optional):
└─ Phase 2 Training
   ├─ Collect training data
   ├─ Train custom YOLO
   └─ Deploy improved detection

🚀 Tương lai (Optional):
└─ Phase 3 Backend
   ├─ Chỉ nếu cần high volume
   └─ 95%+ accuracy
\`\`\`

---

## ✅ Data Collection Strategy (Phase 1 → Phase 2)

\`\`\`javascript
// Mỗi lần user chụp CCCD
const ocrLog = {
  sessionId: uuid(),
  timestamp: new Date(),
  images: {
    front: base64,
    back: base64
  },
  ocrPredicted: {
    fullName: \"Nguyễn Văn A\",
    citizenId: \"123456789012\",
    birthDate: \"1990-01-01\"
  },
  userCorrected: {
    fullName: \"Nguyễn Văn A\",    // User sửa
    citizenId: \"123456789012\",
    birthDate: \"1990-01-01\"
  },
  accuracy: 0.92  // Calculated
}

// Store in IndexedDB → export monthly for training
\`\`\`

---

## 📝 Success Metrics

### Phase 1
- ✅ Detection: 70%+ confidence
- ✅ OCR: 80%+ field accuracy
- ✅ User retry rate: < 20%
- ✅ Data collected: 500+ samples

### Phase 2
- ✅ Detection: 90%+ confidence
- ✅ Custom YOLO trained
- ✅ 5-10% improvement
- ✅ Deploy without issues

### Phase 3 (if needed)
- ✅ Detection: 95%+
- ✅ OCR: 92%+
- ✅ Backend: < 2 sec response
- ✅ Success rate: 90%+

---

## 🎯 Key Takeaways

✅ **Phase 1 = Quick Win**: Deploy within 1-2 weeks
✅ **100% Free**: ml5.js + Tesseract run in browser
✅ **Data Privacy**: Images never leave device
✅ **Easy Upgrade**: Phase 2 ready when you have data
✅ **No Backend Cost**: Unless you need Phase 3 later
✅ **User Verification**: Always show results to user for confirmation

---

## 📚 References

- Tesseract.js: https://github.com/naptha/tesseract.js
- ml5.js: https://learn.ml5js.org/
- YOLOv8: https://github.com/ultralytics/ultralytics
- ONNX Runtime.js: https://github.com/microsoft/onnxruntime-web

---

**Status**: Ready for Phase 1 Implementation
**Next Step**: Proceed with ml5.js + Tesseract.js implementation
"@ | Out-File -Encoding UTF8 -FilePath "ai-report/OCR_Implementation_Plan.md"
