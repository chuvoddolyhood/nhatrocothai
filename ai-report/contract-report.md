# Báo cáo cập nhật chức năng CRUD Hợp đồng

## 1. Kiểm tra hiện trạng ban đầu
- **CREATE**: Đầy đủ, tạo hợp đồng và cập nhật trạng thái phòng.
- **READ**: Chỉ lấy hợp đồng đang hiệu lực (`ACTIVE`), thiếu màn hình xem chi tiết.
- **UPDATE**: Chức năng sửa hoạt động tốt nhưng UI có lỗi (Nút "Xem" và "Sửa" bị trùng lặp chức năng).
- **DELETE**: Sử dụng cơ chế soft-delete (chuyển sang `TERMINATED`) hoạt động tốt nhưng thiếu filter để xem lại.

## 2. Các thay đổi và cải tiến đã thực hiện

### 2.1. Thêm màn hình xem chi tiết (Detail View)
- Tạo component mới `ContractDetailDialog.jsx`.
- Hiển thị đầy đủ thông tin hợp đồng dưới dạng chỉ đọc (Read-only), phân chia rõ ràng các nhóm: Thông tin phòng, Tài chính, Thời hạn, Khách thuê.
- Tích hợp nút "Chỉnh sửa" ngay trong giao diện xem chi tiết để tiện lợi cho việc chuyển đổi.

### 2.2. Khắc phục lỗi UI ở danh sách hợp đồng
- Cập nhật `ContractListPage.jsx` tách biệt rõ ràng hai nút "Xem" (mở `ContractDetailDialog`) và "Sửa" (mở `ContractFormDialog`).

### 2.3. Tối ưu hóa bộ lọc trạng thái (Status Filter)
- Thêm bộ lọc trạng thái (Hiệu lực, Hết hạn, Chấm dứt) để người dùng có thể xem toàn bộ hợp đồng theo vòng đời.
- **Tách Component:** Tạo `ContractStatusFilter.jsx` để tái sử dụng và giữ code gọn gàng.
- **Tối ưu Loading:** Tách trạng thái loading (initial vs list) để khi chuyển tab filter không bị chớp màn hình trắng, thanh filter vẫn giữ nguyên.
- **Tự động cuộn:** Thêm lệnh `window.scrollTo({ top: 0, behavior: 'smooth' })` để trang tự động cuộn lên đầu một cách mượt mà mỗi khi người dùng thay đổi trạng thái filter.

### 2.4. Nâng cấp UI/UX cho bộ lọc (Floating & Sliding Indicator)
- **Floating Filter:** Đồng bộ logic cuộn (scroll) của filter với Header chính của trang:
  - Scroll lên: Nổi ngay dưới header.
  - Scroll xuống: Nổi lên sát trên cùng (khi header ẩn đi).
  - Kết hợp nền trong suốt mờ (`backdrop-filter: blur`) và bóng đổ (shadow) tạo cảm giác floating hiện đại.
- **Sliding Indicator:** 
  - Thay thế `ToggleButtonGroup` mặc định của MUI bằng một custom Pill Slider.
  - Sử dụng CSS `left` và `transition` để tạo hiệu ứng thanh trượt mượt mà khi chuyển trạng thái.
  - Mỗi trạng thái được gán một màu Semantic rõ ràng, kèm hiệu ứng phát sáng (shadow) tương ứng:
    - 🟢 Hiệu lực (Emerald - `#10b981`)
    - 🟡 Hết hạn (Amber - `#f59e0b`)
    - 🔴 Chấm dứt (Rose - `#f43f5e`)