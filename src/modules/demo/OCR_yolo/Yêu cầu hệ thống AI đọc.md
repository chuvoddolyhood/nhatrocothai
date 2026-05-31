# Yêu cầu hệ thống AI đọc chỉ số đồng hồ điện cơ xoay

## Mục tiêu

Xây dựng hệ thống AI có khả năng:

* Nhận ảnh đồng hồ điện cơ xoay
* Tự động nhận diện các chữ số trên đồng hồ
* Xuất ra chỉ số điện dưới dạng số
* Hoạt động ổn định trong điều kiện thực tế

---

# Input

* Ảnh chụp đồng hồ điện cơ
* Nguồn ảnh:

  * Camera điện thoại
  * Webcam
  * CCTV
  * Video frame

Ảnh có thể:

* nghiêng
* rung nhẹ
* thiếu sáng
* bị bóng phản chiếu
* số đang xoay nửa vòng

---

# Output

Ví dụ:

Input:

* Ảnh đồng hồ cơ

Output:

```json
{
  "meter_reading": "12458"
}
```

---

# Yêu cầu kỹ thuật

## 1. Detect vùng chứa dãy số

Sử dụng object detection để:

* xác định vị trí vùng hiển thị số
* crop chính xác khu vực chứa digit

Khuyến nghị:

* YOLOv8

---

## 2. Detect từng digit riêng biệt

Hệ thống phải detect từng chữ số:

* digit_0
* digit_1
* ...
* digit_9

Mỗi digit:

* một bounding box riêng
* confidence score riêng

Không sử dụng OCR toàn ảnh trực tiếp.

---

## 3. Sắp xếp digit

Sau khi detect:

* sort theo tọa độ X từ trái sang phải
* ghép thành chuỗi số hoàn chỉnh

Ví dụ:

```text
1 2 4 5 8
```

=> Output:

```text
12458
```

---

# Image preprocessing

Sử dụng OpenCV để:

* grayscale
* denoise
* threshold
* sharpen
* perspective correction
* adaptive threshold

Mục tiêu:

* tăng độ rõ digit
* giảm nhiễu
* tăng accuracy detection

---

# Validation logic

Hệ thống cần có logic chống đọc sai:

Ví dụ:

* chỉ số mới không được nhỏ hơn chỉ số cũ
* reject nếu confidence thấp
* voting nhiều frame nếu dùng video

Ví dụ:

```text
12458
12458
12459
12458
```

=> kết quả cuối:

```text
12458
```

---

# Dataset requirements

Dataset cần:

* ảnh đồng hồ thực tế
* nhiều điều kiện ánh sáng
* nhiều góc chụp
* đồng hồ cũ/mới
* số đang xoay nửa vòng

Khuyến nghị:

* tối thiểu 2000 ảnh
* production: 5000+ ảnh

Annotation:

* label từng digit riêng biệt

Classes:

```text
digit_0
digit_1
digit_2
digit_3
digit_4
digit_5
digit_6
digit_7
digit_8
digit_9
```

---

# Tech stack đề xuất

## AI / Detection

* YOLOv8
* PyTorch

## Image Processing

* OpenCV

## API

* FastAPI

## Dataset Annotation

* Roboflow
* CVAT

---

# Pipeline hệ thống

```text
Input Image
→ OpenCV preprocessing
→ YOLO detect digits
→ sort digits
→ validation logic
→ output meter reading
```

---

# Mục tiêu accuracy

## MVP

* Accuracy > 90%

## Production

* Accuracy > 97%

---

# Yêu cầu realtime (optional)

Nếu dùng camera/video:

* hỗ trợ realtime inference
* tối ưu GPU
* hỗ trợ temporal smoothing

---

# Kết quả mong muốn

Hệ thống có khả năng:

* đọc chính xác đồng hồ điện cơ
* hoạt động ngoài thực địa
* tích hợp API/mobile/web
* mở rộng production dễ dàng

