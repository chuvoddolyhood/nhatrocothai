import { Button } from '@mui/material';
import { Share2, X } from 'lucide-react';

export function InvoicePreview({ bill, onClose }) {
  const electricUsage = bill.electricCurrent - bill.electricPrevious;
  const waterUsage = bill.waterCurrent - bill.waterPrevious;
  const electricTotal = electricUsage * bill.electricPrice;
  const waterTotal = waterUsage * bill.waterPrice;
  const servicesTotal = bill.otherServices.reduce((sum, s) => sum + s.price, 0);

  const handleShare = () => {
    const message = `
🏠 HÓA ĐƠN TIỀN NHÀ TRỌ
━━━━━━━━━━━━━━━━━━━━
📅 Tháng: ${bill.month}
🚪 Phòng: ${bill.roomNumber}
👤 Khách thuê: ${bill.tenantName}

💰 CHI TIẾT:
━━━━━━━━━━━━━━━━━━━━
🏠 Tiền phòng: ${bill.roomPrice.toLocaleString('vi-VN')} ₫

⚡ Điện:
   Chỉ số cũ: ${bill.electricPrevious} kWh
   Chỉ số mới: ${bill.electricCurrent} kWh
   Tiêu thụ: ${electricUsage} kWh × ${bill.electricPrice.toLocaleString('vi-VN')} ₫
   Thành tiền: ${electricTotal.toLocaleString('vi-VN')} ₫

💧 Nước:
   Chỉ số cũ: ${bill.waterPrevious} m³
   Chỉ số mới: ${bill.waterCurrent} m³
   Tiêu thụ: ${waterUsage} m³ × ${bill.waterPrice.toLocaleString('vi-VN')} ₫
   Thành tiền: ${waterTotal.toLocaleString('vi-VN')} ₫

${bill.otherServices.length > 0 ? `📋 Dịch vụ khác:
${bill.otherServices.map(s => `   ${s.name}: ${s.price.toLocaleString('vi-VN')} ₫`).join('\n')}
` : ''}
━━━━━━━━━━━━━━━━━━━━
💵 TỔNG CỘNG: ${bill.total.toLocaleString('vi-VN')} ₫
${bill.paid ? `✅ Đã thanh toán ngày ${new Date(bill.paidDate).toLocaleDateString('vi-VN')}` : '⏳ Chưa thanh toán'}
━━━━━━━━━━━━━━━━━━━━
    `.trim();

    if (navigator.share) {
      navigator.share({
        title: `Hóa đơn phòng ${bill.roomNumber}`,
        text: message,
      }).catch(() => {
        navigator.clipboard.writeText(message);
        alert('Đã sao chép hóa đơn vào clipboard!');
      });
    } else {
      navigator.clipboard.writeText(message);
      alert('Đã sao chép hóa đơn vào clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl">Hóa đơn</h2>
        <Button
          onClick={onClose}
          sx={{ minWidth: 'auto', borderRadius: '12px' }}
        >
          <X />
        </Button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
        <div className="text-center mb-6 pb-4 border-b-2 border-indigo-200">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl text-white">🏠</span>
          </div>
          <h3 className="text-xl mb-1">HÓA ĐƠN TIỀN NHÀ TRỌ</h3>
          <p className="text-gray-600 text-sm">Tháng {bill.month}</p>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Phòng:</span>
            <span className="font-medium">{bill.roomNumber}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-600">Khách thuê:</span>
            <span className="font-medium">{bill.tenantName}</span>
          </div>
        </div>

        <div className="border-t-2 border-b-2 border-gray-200 py-4 mb-4">
          <h3 className="font-medium mb-4 text-lg">Chi tiết thanh toán</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tiền phòng</span>
              <span className="font-medium">{bill.roomPrice.toLocaleString('vi-VN')} ₫</span>
            </div>

            <div className="bg-yellow-50 p-3 rounded-xl">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>⚡ Điện: {bill.electricPrevious} → {bill.electricCurrent} kWh</span>
                <span>{electricUsage} × {bill.electricPrice.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tiền điện</span>
                <span className="font-medium">{electricTotal.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>💧 Nước: {bill.waterPrevious} → {bill.waterCurrent} m³</span>
                <span>{waterUsage} × {bill.waterPrice.toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Tiền nước</span>
                <span className="font-medium">{waterTotal.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {bill.otherServices.map((service, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{service.name}</span>
                <span className="font-medium">{service.price.toLocaleString('vi-VN')} ₫</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg">Tổng cộng</span>
            <span className="text-2xl font-bold">{bill.total.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>

        {bill.paid && (
          <div className="bg-green-50 p-4 rounded-xl text-center border-2 border-green-200">
            <p className="text-green-700 font-medium">
              ✓ Đã thanh toán ngày {new Date(bill.paidDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        )}

        {!bill.paid && (
          <div className="bg-orange-50 p-4 rounded-xl text-center border-2 border-orange-200">
            <p className="text-orange-700 font-medium">⏳ Chưa thanh toán</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{ borderRadius: '12px', py: 1.5 }}
        >
          Đóng
        </Button>
        <Button
          variant="contained"
          startIcon={<Share2 />}
          onClick={handleShare}
          fullWidth
          sx={{ borderRadius: '12px', py: 1.5 }}
        >
          Chia sẻ
        </Button>
      </div>
    </div>
  );
}
