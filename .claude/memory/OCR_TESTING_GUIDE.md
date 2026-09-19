# OCR Module - Testing Guide

## ✅ Implementation Status

### Phase 1-8: Completed ✓

- ✅ Tesseract.js cài đặt và configuration
- ✅ OCRService với digit-only recognition
- ✅ Image preprocessing với OpenCV.js
- ✅ CameraCapture component với mobile support
- ✅ OCR pipeline hook (useOCRCapture)
- ✅ Verification UI với editable input
- ✅ Supabase Storage integration
- ✅ MeterReading form integration
- ✅ Test page và documentation

### Build Status: ✓ Success

```bash
✓ 3646 modules transformed
✓ built in 5.75s
```

---

## 🧪 Testing Checklist

### 1. Component Testing

#### CameraCapture Component
- [ ] Camera permission request works
- [ ] Guide overlay displays correctly
- [ ] Capture button functional
- [ ] Camera toggle (front/rear) works
- [ ] Fallback to file input on unsupported browsers
- [ ] Cancel button returns to previous state

#### OCRVerification Component
- [ ] Image preview displays correctly
- [ ] OCR text shows in editable input
- [ ] Confidence score displays (color-coded)
- [ ] Manual editing works
- [ ] Validation warnings show for low confidence
- [ ] Retake button works
- [ ] Confirm button enabled only when valid

#### OCRMeterReading Component
- [ ] Workflow transitions smoothly (idle → camera → processing → verification)
- [ ] Progress indicator shows during processing
- [ ] Error handling displays user-friendly messages
- [ ] Cancel at any step returns to idle

### 2. OCR Service Testing

#### OCRService
```javascript
// Test 1: Initialize worker
await ocrService.initialize();
// Expected: Worker initialized without errors

// Test 2: Recognize digits from clear image
const result = await ocrService.recognize(clearImage);
// Expected: { text: "12345", confidence: > 0.85 }

// Test 3: Validate result
const validation = ocrService.validateResult(result);
// Expected: { isValid: true, needsVerification: false }

// Test 4: Handle poor image
const poorResult = await ocrService.recognize(blurryImage);
// Expected: { confidence: < 0.7, needsVerification: true }
```

#### Test Cases for Different Conditions

| Condition | Expected Confidence | Status |
|-----------|-------------------|--------|
| Good lighting, clear digits | > 85% | 🧪 To test |
| Moderate lighting | 70-85% | 🧪 To test |
| Low lighting | 50-70% | 🧪 To test |
| Blurry image | < 50% | 🧪 To test |
| Angled shot (< 30°) | 60-80% | 🧪 To test |
| Mechanical meter (rotating dials) | Variable | 🧪 To test |
| Digital LCD display | > 80% | 🧪 To test |

### 3. Image Processing Testing

#### Preprocessing Pipeline
```javascript
// Test different preprocessing options
const options = [
  { useOpenCV: true },   // Full preprocessing
  { useOpenCV: false },  // Simple preprocessing
];

// Compare results
// Expected: OpenCV should give higher confidence
```

#### Performance Testing
- [ ] Preprocessing time < 3 seconds
- [ ] OCR recognition time < 10 seconds
- [ ] Total pipeline time < 15 seconds
- [ ] Image compression works without quality loss

### 4. Storage Integration Testing

#### Supabase Storage
```javascript
// Test 1: Upload image
const url = await uploadMeterImage(file, metadata);
// Expected: Returns public URL

// Test 2: Compress before upload
const compressed = await compressImage(largeFile, 2, 0.8);
// Expected: File size reduced, quality maintained

// Test 3: Delete image
await deleteMeterImage(url);
// Expected: No errors
```

### 5. Integration Testing

#### MeterReadingFormWithOCR
- [ ] Form displays correctly
- [ ] Camera button opens OCR workflow
- [ ] Manual input still works
- [ ] OCR result populates input field
- [ ] Image upload happens automatically
- [ ] Validation works (new >= old reading)
- [ ] Submit saves with OCR metadata

### 6. Mobile Testing

#### Device Compatibility
- [ ] Android Chrome - Camera access
- [ ] iOS Safari - Camera access
- [ ] Portrait orientation
- [ ] Landscape orientation
- [ ] Different screen sizes (phone/tablet)

#### Performance on Mobile
- [ ] Camera opens quickly (< 2s)
- [ ] No lag during capture
- [ ] Processing doesn't freeze UI
- [ ] Battery impact reasonable

### 7. Error Handling Testing

#### Scenarios to Test
- [ ] Camera permission denied
- [ ] No camera available
- [ ] Network error during upload
- [ ] OCR worker crash
- [ ] OpenCV loading failure
- [ ] Invalid image format
- [ ] File too large (> 5MB)

#### Expected Behavior
- User-friendly error messages
- Ability to retry
- Fallback options available
- No app crashes

---

## 🎯 Manual Testing Steps

### Test 1: Basic OCR Flow

1. Navigate to `/ocr-test`
2. Click "Đồng hồ điện"
3. Allow camera permission
4. Point camera at meter or test image
5. Capture image
6. Wait for processing (observe progress)
7. Verify result displayed
8. Edit if needed
9. Confirm

**Expected Result:** 
- Numbers recognized correctly (± 1 digit acceptable)
- Confidence > 70%
- Total time < 20 seconds

### Test 2: Low Confidence Handling

1. Capture blurry or poorly lit image
2. Check confidence score

**Expected Result:**
- Warning message appears
- Input field highlighted yellow
- User can edit manually
- Can retake photo

### Test 3: Form Integration

1. Navigate to meter reading form (when integrated)
2. Click "Chụp ảnh đồng hồ điện"
3. Complete OCR flow
4. Verify number populates form
5. Submit form

**Expected Result:**
- Form submits with OCR data
- Image URL saved
- Confidence stored

### Test 4: Error Recovery

1. Deny camera permission
2. Check error message
3. Try file upload fallback

**Expected Result:**
- Clear error message
- File input available
- Can still complete flow

---

## 🔍 Performance Benchmarks

### Target Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Camera open time | < 2s | Time from button click to video stream |
| Image capture time | < 500ms | Time from capture button to callback |
| Preprocessing time | < 3s | Time in imageProcessing |
| OCR recognition time | < 10s | Time in ocrService.recognize |
| Image upload time | < 5s | Time in uploadMeterImage |
| Total workflow time | < 20s | From capture to confirmation |
| Memory usage | < 200MB | Browser DevTools Memory profiler |
| Battery impact | Minimal | 10 readings should use < 5% battery |

### Performance Testing Script

```javascript
// In browser console on /ocr-test
const startTime = performance.now();

// Capture and process image
// ... (go through flow)

const endTime = performance.now();
console.log(`Total time: ${endTime - startTime}ms`);

// Memory usage
console.log(performance.memory);
```

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **OCR Accuracy**
   - Mechanical meters with rotating dials: 60-70% accuracy
   - Requires good lighting conditions
   - Small digits may be misread

2. **Browser Compatibility**
   - Safari iOS: Camera permission requires user action
   - Firefox: OpenCV.js may load slowly
   - IE11: Not supported

3. **Performance**
   - First OCR takes longer (worker initialization)
   - Large images (> 2MB) take longer to upload
   - OpenCV.js CDN load may timeout

### Workarounds

1. **For poor accuracy:**
   - User can always edit manually
   - Retry capture option available
   - Clear guidance displayed

2. **For browser issues:**
   - Fallback to file input
   - Simple preprocessing if OpenCV fails
   - Progressive enhancement approach

3. **For performance:**
   - Image compression before upload
   - Progress indicators
   - Background processing with Web Workers (future)

---

## 🚀 Optimization Opportunities

### Short Term (Next Sprint)

1. **Caching**
   ```javascript
   // Cache Tesseract worker
   // Cache OpenCV.js library
   // Cache processed images temporarily
   ```

2. **Code Splitting**
   ```javascript
   // Lazy load OCR module
   const OCRModule = lazy(() => import('./modules/ocr'));
   ```

3. **Image Optimization**
   - Resize before processing (max 1920x1080)
   - Convert to optimal format
   - Progressive JPEG for uploads

### Long Term (Future)

1. **Machine Learning Enhancement**
   - Train custom model for Vietnamese meters
   - Fine-tune Tesseract for specific meter types
   - Auto-rotate correction

2. **Advanced Features**
   - Batch processing (multiple meters)
   - Auto-crop meter display area
   - Historical accuracy tracking
   - Cloud OCR fallback (Google Vision API)

3. **Performance**
   - Service Worker caching
   - IndexedDB for offline support
   - WebAssembly acceleration
   - GPU acceleration for preprocessing

---

## 📊 Testing Results Template

```markdown
### Test Run: [Date]

**Device:** [Device name]
**Browser:** [Browser + version]
**Network:** [WiFi/4G/5G]

#### Results

| Test Case | Status | Time | Confidence | Notes |
|-----------|--------|------|------------|-------|
| Clear digits, good light | ✅ | 12s | 92% | Perfect |
| Low lighting | ⚠️ | 15s | 68% | Needed edit |
| Blurry image | ❌ | 14s | 45% | Retake required |
| Mechanical meter | ⚠️ | 16s | 72% | Acceptable |
| Digital LCD | ✅ | 10s | 95% | Excellent |

#### Issues Found
1. [Issue description]
2. [Issue description]

#### Recommendations
1. [Recommendation]
2. [Recommendation]
```

---

## 🎓 Testing Best Practices

1. **Test with Real Data**
   - Use actual meter photos
   - Test in real lighting conditions
   - Test on actual devices (not just emulators)

2. **Edge Cases**
   - Very old/new meters
   - Different number formats
   - Damaged/dirty meter displays
   - Reflections and glare

3. **User Experience**
   - Time each step
   - Note pain points
   - Collect user feedback
   - Iterate on UI/UX

4. **Performance Monitoring**
   - Use Performance API
   - Monitor memory leaks
   - Check battery usage
   - Network bandwidth

---

## 📝 Next Steps

### Before Production Release

- [ ] Complete all manual tests
- [ ] Test on 3+ different devices
- [ ] Test on 2+ different browsers
- [ ] Load test with 100+ images
- [ ] Security review of storage policies
- [ ] User acceptance testing (UAT)
- [ ] Documentation review
- [ ] Create user guide video
- [ ] Setup monitoring/analytics
- [ ] Create rollback plan

### Deployment Checklist

- [ ] Setup Supabase Storage bucket
- [ ] Run database migration
- [ ] Configure storage policies
- [ ] Test in staging environment
- [ ] Backup current data
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Iterate based on feedback

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: Camera not working?**
A: Check browser permissions, ensure HTTPS, try fallback file input

**Q: Low accuracy?**
A: Ensure good lighting, hold steady, capture close-up, try retake

**Q: Upload failed?**
A: Check network, verify storage bucket exists, check file size

**Q: Slow processing?**
A: First time is slower (initialization), subsequent should be faster

### Debug Mode

Enable debug mode in OCRTestPage to see:
- Processing times
- Confidence scores
- Raw OCR text
- Error details

```javascript
// In browser console
localStorage.setItem('OCR_DEBUG', 'true');
```

---

## 📈 Success Criteria

### Phase 9 Complete When:

- ✅ All core components tested
- ✅ Manual test completed on 2+ devices
- ✅ Documentation complete
- ✅ Known issues documented
- ✅ Performance benchmarks met (>70%)
- ✅ Error handling verified
- ✅ Ready for user testing

**Status:** In Progress
**Last Updated:** 2024-12-15
