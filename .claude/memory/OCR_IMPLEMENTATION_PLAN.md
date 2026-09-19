# OCR Implementation Plan — Tesseract.js + OpenCV.js

## Executive Summary

Implement client-side OCR workflow cho việc đọc số điện/nước từ đồng hồ qua camera điện thoại.

**Tech Stack:**
- **Tesseract.js** — Client-side OCR engine (JavaScript port of Tesseract)
- **OpenCV.js** — Image preprocessing (contrast, rotation, crop)
- **HTML5 Camera API** — Rear camera access on mobile
- **Supabase Storage** — Store captured images

**Target Accuracy:** 85-90% for digits in good lighting conditions

---

## Phase 1: Research & Setup (1-2 days)

### 1.1. Dependencies Installation

```bash
npm install tesseract.js
npm install opencv.js  # hoặc load from CDN
```

### 1.2. Tesseract.js Configuration

```javascript
import Tesseract from 'tesseract.js';

const worker = await Tesseract.createWorker({
  lang: 'eng',
  oem: Tesseract.OEM.LSTM_ONLY,
  psm: Tesseract.PSM.SINGLE_WORD,
});

// Whitelist only digits
await worker.setParameters({
  tessedit_char_whitelist: '0123456789',
});
```

### 1.3. OpenCV.js Integration

```html
<!-- Load OpenCV.js from CDN -->
<script async src="https://docs.opencv.org/4.x/opencv.js" onload="onOpenCvReady();" type="text/javascript"></script>
```

---

## Phase 2: UI/UX Design (2 days)

### 2.1. Camera Component Structure

```
MeterReadingPage
├── CameraCapture
│   ├── CameraOverlay (guide frame)
│   ├── CaptureButton
│   └── ImagePreview
├── OCRResultDisplay
│   ├── ConfidenceScore
│   ├── EditableInput
│   └── ConfirmButton
└── MeterReadingForm
    ├── ElectricMeter (old/new)
    ├── WaterMeter (old/new)
    └── SaveButton
```

### 2.2. Camera Overlay Design

```
┌─────────────────────────┐
│     📷 Rear Camera      │
│                         │
│   ┌───────────────┐     │
│   │               │     │  ← Guide frame
│   │   Align meter │     │
│   │   here        │     │
│   └───────────────┘     │
│                         │
│   💡 Tips:              │
│   - Good lighting       │
│   - Hold steady         │
│   - Fill the frame      │
│                         │
│   [  Chụp ảnh  ]        │
└─────────────────────────┘
```

### 2.3. OCR Result UI

```
┌─────────────────────────┐
│  📸 Ảnh vừa chụp        │
│  [thumbnail]            │
│                         │
│  🤖 OCR đọc được:       │
│  ┌──────────┐           │
│  │  1 2 3 4 │  ✏️       │  ← Editable
│  └──────────┘           │
│  Độ chính xác: 87%      │
│                         │
│  [  Chụp lại  ]         │
│  [  Xác nhận  ]         │
└─────────────────────────┘
```

---

## Phase 3: Image Preprocessing Pipeline (3-4 days)

### 3.1. OpenCV.js Preprocessing Steps

```javascript
/**
 * Preprocess image before OCR
 * @param {HTMLImageElement} img - Captured image
 * @returns {HTMLCanvasElement} - Processed image
 */
async function preprocessImage(img) {
  const src = cv.imread(img);
  
  // Step 1: Convert to grayscale
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  
  // Step 2: Increase contrast
  const enhanced = new cv.Mat();
  cv.equalizeHist(gray, enhanced);
  
  // Step 3: Denoise
  const denoised = new cv.Mat();
  cv.fastNlMeansDenoising(enhanced, denoised);
  
  // Step 4: Adaptive thresholding
  const binary = new cv.Mat();
  cv.adaptiveThreshold(
    denoised,
    binary,
    255,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY,
    11,
    2
  );
  
  // Step 5: Dilation to connect broken digits
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
  const dilated = new cv.Mat();
  cv.dilate(binary, dilated, kernel);
  
  // Convert back to canvas
  const canvas = document.createElement('canvas');
  cv.imshow(canvas, dilated);
  
  // Cleanup
  src.delete();
  gray.delete();
  enhanced.delete();
  denoised.delete();
  binary.delete();
  kernel.delete();
  dilated.delete();
  
  return canvas;
}
```

### 3.2. Auto-Crop Meter Display Area

```javascript
/**
 * Detect and crop meter display area
 * Uses contour detection to find rectangular regions
 */
async function cropMeterArea(src) {
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  
  cv.findContours(
    src,
    contours,
    hierarchy,
    cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE
  );
  
  // Find largest rectangular contour
  let maxArea = 0;
  let bestRect = null;
  
  for (let i = 0; i < contours.size(); i++) {
    const cnt = contours.get(i);
    const area = cv.contourArea(cnt);
    
    if (area > maxArea) {
      const rect = cv.boundingRect(cnt);
      // Filter by aspect ratio (meter displays are usually wide)
      if (rect.width / rect.height > 2) {
        maxArea = area;
        bestRect = rect;
      }
    }
  }
  
  if (bestRect) {
    const cropped = src.roi(bestRect);
    return cropped;
  }
  
  return src; // Return original if no good region found
}
```

### 3.3. Rotation Correction

```javascript
/**
 * Correct image rotation using Hough Line Transform
 */
async function correctRotation(src) {
  const edges = new cv.Mat();
  cv.Canny(src, edges, 50, 150, 3);
  
  const lines = new cv.Mat();
  cv.HoughLines(edges, lines, 1, Math.PI / 180, 100);
  
  // Calculate median angle
  let angles = [];
  for (let i = 0; i < lines.rows; i++) {
    const angle = lines.data32F[i * 2 + 1] * (180 / Math.PI);
    angles.push(angle);
  }
  
  if (angles.length > 0) {
    angles.sort((a, b) => a - b);
    const medianAngle = angles[Math.floor(angles.length / 2)];
    
    // Rotate image
    const center = new cv.Point(src.cols / 2, src.rows / 2);
    const rotationMatrix = cv.getRotationMatrix2D(center, medianAngle, 1);
    const rotated = new cv.Mat();
    cv.warpAffine(src, rotated, rotationMatrix, src.size());
    
    edges.delete();
    lines.delete();
    rotationMatrix.delete();
    
    return rotated;
  }
  
  edges.delete();
  lines.delete();
  return src;
}
```

---

## Phase 4: OCR Integration (2-3 days)

### 4.1. Tesseract.js Worker Setup

```javascript
// services/OCRService.js
import Tesseract from 'tesseract.js';

class OCRService {
  constructor() {
    this.worker = null;
  }
  
  async initialize() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker({
        lang: 'eng',
        oem: Tesseract.OEM.LSTM_ONLY,
        psm: Tesseract.PSM.SINGLE_BLOCK, // Better for meter displays
        logger: (m) => console.log('[OCR]', m), // Progress logging
      });
      
      await this.worker.setParameters({
        tessedit_char_whitelist: '0123456789',
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      });
    }
  }
  
  async recognize(imageCanvas) {
    await this.initialize();
    
    const { data } = await this.worker.recognize(imageCanvas);
    
    return {
      text: data.text.replace(/\D/g, ''), // Remove non-digits
      confidence: data.confidence / 100, // Normalize to 0-1
      rawText: data.text,
    };
  }
  
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
```

### 4.2. Full OCR Pipeline

```javascript
// hooks/useOCRCapture.js
import { useState } from 'react';
import { ocrService } from '../services/OCRService';
import { preprocessImage, cropMeterArea, correctRotation } from '../utils/imageProcessing';

export function useOCRCapture() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  
  async function processImage(imageFile) {
    setIsProcessing(true);
    
    try {
      // Step 1: Load image
      const img = await loadImage(imageFile);
      
      // Step 2: Preprocess
      const processed = await preprocessImage(img);
      
      // Step 3: Auto-crop (optional)
      // const cropped = await cropMeterArea(processed);
      
      // Step 4: OCR
      const ocrResult = await ocrService.recognize(processed);
      
      // Step 5: Validate
      const validated = validateOCRResult(ocrResult);
      
      setResult(validated);
      return validated;
      
    } catch (error) {
      console.error('[OCR] Error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }
  
  function validateOCRResult(result) {
    // Validation rules
    const isValid = 
      result.text.length >= 3 && // At least 3 digits
      result.text.length <= 8 && // Max 8 digits
      result.confidence > 0.6;   // Min 60% confidence
    
    return {
      ...result,
      isValid,
      needsVerification: !isValid || result.confidence < 0.85,
    };
  }
  
  return {
    processImage,
    isProcessing,
    result,
  };
}
```

---

## Phase 5: Mobile Camera Integration (2 days)

### 5.1. Camera Component

```jsx
// components/CameraCapture.jsx
import { useRef, useState } from 'react';

export function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  
  async function startCamera() {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
    }
  }
  
  function captureImage() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'meter.jpg', { type: 'image/jpeg' });
      onCapture(file);
    }, 'image/jpeg', 0.9);
  }
  
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }
  
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);
  
  return (
    <div className="camera-container">
      <video ref={videoRef} autoPlay playsInline />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Guide overlay */}
      <div className="camera-overlay">
        <div className="guide-frame" />
        <div className="tips">
          <p>💡 Căn đồng hồ vào khung</p>
          <p>💡 Giữ điện thoại thẳng</p>
          <p>💡 Đảm bảo ánh sáng tốt</p>
        </div>
      </div>
      
      <button onClick={captureImage} className="capture-btn">
        📷 Chụp ảnh
      </button>
    </div>
  );
}
```

### 5.2. Fallback: File Input

```jsx
// Fallback for browsers without camera access
<input
  type="file"
  accept="image/*"
  capture="environment"
  onChange={(e) => onCapture(e.target.files[0])}
/>
```

---

## Phase 6: Validation & User Verification (2 days)

### 6.1. Validation Rules

```javascript
// utils/meterValidation.js

export function validateMeterReading(newReading, oldReading) {
  const errors = [];
  
  // Rule 1: New reading must be >= old reading
  if (newReading < oldReading) {
    errors.push('Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ');
  }
  
  // Rule 2: Usage must be reasonable (< 1000 kWh/month for electric)
  const usage = newReading - oldReading;
  if (usage > 1000) {
    errors.push(`Lượng tiêu thụ ${usage} kWh có vẻ không hợp lý. Vui lòng kiểm tra lại.`);
  }
  
  // Rule 3: Must be numeric
  if (!/^\d+$/.test(newReading.toString())) {
    errors.push('Chỉ số phải là số nguyên');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

### 6.2. User Verification UI

```jsx
// components/OCRVerification.jsx

export function OCRVerification({ ocrResult, onConfirm, onRetake }) {
  const [editedValue, setEditedValue] = useState(ocrResult.text);
  const [showWarning, setShowWarning] = useState(false);
  
  const needsVerification = ocrResult.confidence < 0.85;
  
  return (
    <div className="ocr-verification">
      <img src={ocrResult.imageUrl} alt="Captured" className="preview" />
      
      <div className="result-section">
        <h3>🤖 OCR đọc được:</h3>
        
        <input
          type="number"
          value={editedValue}
          onChange={(e) => setEditedValue(e.target.value)}
          className={needsVerification ? 'warning' : 'success'}
        />
        
        <div className="confidence">
          Độ chính xác: {(ocrResult.confidence * 100).toFixed(0)}%
          {needsVerification && (
            <span className="badge warning">Cần kiểm tra</span>
          )}
        </div>
        
        {needsVerification && (
          <p className="warning-text">
            ⚠️ Độ tin cậy thấp. Vui lòng kiểm tra kỹ số liệu.
          </p>
        )}
      </div>
      
      <div className="actions">
        <button onClick={onRetake} className="btn-secondary">
          📷 Chụp lại
        </button>
        <button
          onClick={() => onConfirm(editedValue)}
          className="btn-primary"
        >
          ✅ Xác nhận
        </button>
      </div>
    </div>
  );
}
```

---

## Phase 7: Supabase Storage Integration (1 day)

### 7.1. Upload Image to Supabase

```javascript
// services/ImageStorageService.js
import { supabase } from '../supabase/config';

export async function uploadMeterImage(file, metadata) {
  const fileName = `${metadata.roomId}_${metadata.month}_${metadata.type}.jpg`;
  const filePath = `meter-readings/${fileName}`;
  
  const { data, error } = await supabase.storage
    .from('meter-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('meter-images')
    .getPublicUrl(filePath);
  
  return publicUrl;
}
```

### 7.2. Save Meter Reading with OCR Metadata

```javascript
// services/MeterReadingService.js

export async function saveMeterReading(data) {
  const { data: result, error } = await supabase
    .from('meter_readings')
    .insert([{
      room_id: data.roomId,
      contract_id: data.contractId,
      month: data.month, // 'YYYY-MM'
      electric_old: data.electricOld,
      electric_new: data.electricNew,
      electric_used: data.electricNew - data.electricOld,
      water_old: data.waterOld,
      water_new: data.waterNew,
      water_used: data.waterNew - data.waterOld,
      electric_image_url: data.electricImageUrl,
      water_image_url: data.waterImageUrl,
      electric_ocr_text: data.electricOCRText,
      water_ocr_text: data.waterOCRText,
      electric_ocr_confidence: data.electricOCRConfidence,
      water_ocr_confidence: data.waterOCRConfidence,
      verified: true, // User confirmed
      verified_by: data.userId,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return result;
}
```

---

## Phase 8: Testing & Optimization (3-4 days)

### 8.1. Test Cases

#### Test 1: Good Conditions
- ✅ Good lighting
- ✅ Clear digits
- ✅ Straight angle
- **Expected:** Confidence > 90%

#### Test 2: Low Light
- ⚠️ Dim lighting
- **Expected:** Confidence 60-80%, needs verification

#### Test 3: Blurry Image
- ⚠️ Motion blur
- **Expected:** Low confidence, suggest retake

#### Test 4: Angled Shot
- ⚠️ Camera at 30° angle
- **Expected:** Rotation correction works

#### Test 5: Different Meter Types
- Mechanical meters (rotating dials)
- Digital LCD meters
- LED displays

### 8.2. Performance Optimization

```javascript
// Lazy load Tesseract worker
const loadOCRWorker = () => import('../services/OCRService');

// Use Web Workers for heavy processing
const preprocessWorker = new Worker('/workers/preprocess.worker.js');

// Cache processed images
const imageCache = new Map();
```

### 8.3. Error Handling

```javascript
try {
  const result = await processImage(file);
} catch (error) {
  if (error.name === 'NotAllowedError') {
    alert('Bạn cần cấp quyền camera để sử dụng tính năng này');
  } else if (error.name === 'NotFoundError') {
    alert('Không tìm thấy camera');
  } else {
    alert('Lỗi xử lý ảnh. Vui lòng thử lại.');
  }
}
```

---

## Phase 9: UI Polish & UX (2 days)

### 9.1. Loading States

```jsx
{isProcessing && (
  <div className="ocr-loading">
    <div className="spinner" />
    <p>Đang xử lý ảnh...</p>
    <p className="hint">Có thể mất 5-10 giây</p>
  </div>
)}
```

### 9.2. Success Feedback

```jsx
{ocrSuccess && (
  <div className="success-toast">
    ✅ Đã lưu chỉ số điện nước thành công!
  </div>
)}
```

### 9.3. Progressive Disclosure

```
Flow:
1. Button "Ghi chỉ số điện nước"
2. Choose: "Chụp ảnh" or "Nhập thủ công"
3. If "Chụp ảnh":
   a. Camera overlay
   b. Capture
   c. OCR processing
   d. Verification UI
   e. Confirm
4. Save to database
```

---

## Technical Challenges & Solutions

| Challenge | Solution |
|---|---|
| OCR accuracy with mechanical meters | Use multiple preprocessing filters, allow user correction |
| Slow processing time | Use Web Workers, show progress indicator |
| Large image file sizes | Compress before upload (JPEG quality 0.8) |
| Camera access denied | Fallback to file input |
| Different meter formats | Support both digital and analog meters |
| Network issues during upload | Implement offline queue, retry logic |

---

## Performance Targets

| Metric | Target |
|---|---|
| OCR processing time | < 10 seconds |
| Image upload time | < 5 seconds |
| Total time (capture → save) | < 20 seconds |
| OCR accuracy (good conditions) | > 85% |
| Mobile battery impact | Minimal (< 5% per 10 readings) |

---

## Rollout Plan

### Week 1-2: Foundation
- [ ] Install dependencies
- [ ] Setup Tesseract.js worker
- [ ] Implement basic camera capture

### Week 3: Image Processing
- [ ] OpenCV.js integration
- [ ] Preprocessing pipeline
- [ ] Auto-crop & rotation

### Week 4: OCR Integration
- [ ] Tesseract.js recognition
- [ ] Validation logic
- [ ] User verification UI

### Week 5: Storage & Database
- [ ] Supabase Storage upload
- [ ] MeterReading CRUD
- [ ] Invoice auto-generation

### Week 6: Testing & Polish
- [ ] Test with real meter images
- [ ] Optimize performance
- [ ] UI/UX refinements

### Week 7: Beta Testing
- [ ] Test with 5-10 real users
- [ ] Gather feedback
- [ ] Fix critical bugs

### Week 8: Launch
- [ ] Production deployment
- [ ] User documentation
- [ ] Monitor & iterate

---

## Budget Estimate (Self-Hosted)

| Item | Cost |
|---|---|
| Tesseract.js | FREE (open-source) |
| OpenCV.js | FREE (open-source) |
| Supabase Storage | FREE tier: 1GB |
| Development time | 6-8 weeks |
| **Total Cost** | **$0** (excluding dev time) |

---

## Success Metrics

| Metric | Goal |
|---|---|
| OCR adoption rate | > 70% of readings use OCR |
| Average accuracy | > 80% |
| User satisfaction | > 4/5 stars |
| Time saved per reading | 30-60 seconds |

---

## Future Enhancements (Phase 2)

- [ ] Machine learning model fine-tuning for Vietnamese meter types
- [ ] Automatic meter type detection
- [ ] Batch processing (multiple meters in one session)
- [ ] Historical accuracy tracking
- [ ] Cloud OCR fallback (Google Vision API) for low confidence
- [ ] Voice input as alternative

---

## References

- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [OpenCV.js Tutorial](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)
- [MDN Camera API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

---

**Status:** 📋 Planning Complete — Ready for Implementation

**Next Steps:** Start with Phase 1 (Research & Setup) once CRUD operations are fully tested and stable.
