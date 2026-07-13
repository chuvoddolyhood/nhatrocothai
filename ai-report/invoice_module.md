# Báo cáo Chức năng Quản lý Hóa đơn (Invoice Module)

## 1. Tổng quan
Module Hóa đơn (`invoice`) được xây dựng nhằm mục đích quản lý các khoản thu chi hàng tháng của khách thuê phòng. Toàn bộ logic được thiết kế theo hướng tiện dụng, tự động hóa cao và giao diện đẹp mắt (UI/UX tối ưu).

## 2. Cấu trúc và Luồng dữ liệu

### 2.1. Danh sách Hóa đơn (`InvoiceListPage.jsx`)
- Hiển thị danh sách hóa đơn với dạng Card bo góc, có gradient nền riêng biệt tạo cảm giác hiện đại.
- **Thanh lọc trạng thái (`InvoiceStatusFilter.jsx`)**: 
  - Gắn thuộc tính `sticky` thông minh, tự động ẩn/hiện phối hợp nhịp nhàng với `<Header />` của ứng dụng.
  - Các nút trạng thái (Chưa thanh toán, Đã thanh toán, Quá hạn) được phối màu gradient bắt mắt, thay đổi động theo từng trạng thái.
- **Bộ lọc động**: Có thể lọc theo Tháng, Phòng và Trạng thái. Các bộ lọc có tác dụng ngay lập tức mà không cần reload trang.

### 2.2. Tạo/Sửa Hóa đơn (`InvoiceFormDialog.jsx`)
- **Luồng 2 bước mượt mà**:
  - **Bước 1 (Chọn phòng)**: Chỉ hiển thị các phòng ĐANG CÓ KHÁCH (hợp đồng ACTIVE) và CHƯA ĐƯỢC TẠO HÓA ĐƠN trong tháng đang chọn.
  - **Bước 2 (Nhập chỉ số & tính toán)**: Tự động truy xuất giá điện/nước (từ bảng `properties`) và chỉ số điện/nước cũ nhất (từ bảng `meter_readings`) để tự động tính thành tiền. 
- **Sửa hóa đơn**: Cho phép sửa hóa đơn nếu hóa đơn chưa thanh toán. Form sẽ bỏ qua Bước 1 và tự động điền lại các thông số cũ.
- **Xóa (Soft-delete)**: Hóa đơn chưa thanh toán có thể bị xóa mềm (chuyển trạng thái `CANCELLED`). Sau khi xóa, phòng đó sẽ lập tức khả dụng để tạo lại hóa đơn mới trong tháng.

### 2.3. Thanh toán và Xem chi tiết
- **`InvoiceDetailDialog.jsx`**: Cung cấp cái nhìn chi tiết về các mục tính tiền (tiền phòng, điện, nước, phí dịch vụ, v.v.).
- **`InvoicePaymentDialog.jsx`**: Hỗ trợ đánh dấu thanh toán (chọn phương thức thanh toán tiền mặt/chuyển khoản, ghi chú).

## 3. Kiến trúc Database và Service (`InvoiceService.js`)
Service layer được thiết kế đồng bộ hoàn toàn với schema SQL:
- `getInvoices`: Join dữ liệu từ `invoices`, `invoice_tenants`, và `tenants` để lấy tên khách thuê đại diện chỉ trong 1 query. Lọc bỏ các hóa đơn có trạng thái `CANCELLED`.
- `createInvoice`: Khi tạo hóa đơn, tự động lưu chỉ số điện nước vào bảng `meter_readings` và tạo bản ghi trung gian trong `invoice_tenants`.
- `updateInvoice`: Hỗ trợ cập nhật cả `invoices` và `meter_readings` tương ứng của tháng đó.
- `markAsPaid`: Cập nhật trạng thái `invoices` thành `PAID` và tạo mới 1 bản ghi vào bảng `payments` để làm bằng chứng thanh toán.
- **Audit Logging**: Tất cả các hành động Insert/Update trên `invoices`, `meter_readings`, `payments` đều được gán đầy đủ các trường `created_at`, `created_by`, `updated_at`, `updated_by` để đảm bảo tracking dữ liệu theo yêu cầu schema mới nhất.

## 4. Công việc tiếp theo (To-do)
- Tích hợp nhận diện OCR qua camera để đọc số điện/nước thay vì nhập tay.
- Gửi thông báo (Zalo/SMS/Push) cho khách thuê khi hóa đơn được tạo hoặc quá hạn.
