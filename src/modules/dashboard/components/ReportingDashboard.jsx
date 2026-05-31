import { Card, CardContent } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import Header from '../../../shared/components/ui/Header';

export function ReportingDashboard({ bills, rooms }) {
  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date.toISOString().slice(0, 7));
    }
    return months;
  };

  const months = getLast6Months();

  const revenueData = months.map(month => {
    const monthBills = bills.filter(b => b.month === month);
    const total = monthBills.reduce((sum, b) => sum + b.total, 0);
    const paid = monthBills.filter(b => b.paid).reduce((sum, b) => sum + b.total, 0);

    return {
      month: `T${month.slice(5)}`,
      'Dự kiến': total / 1000000,
      'Đã thu': paid / 1000000,
    };
  });

  const roomStatusData = [
    { name: 'Đang thuê', value: rooms.filter(r => r.status === 'occupied').length, fill: '#6366f1' },
    { name: 'Trống', value: rooms.filter(r => r.status === 'empty').length, fill: '#10b981' },
    { name: 'Sửa chữa', value: rooms.filter(r => r.status === 'repair').length, fill: '#f59e0b' },
  ];

  const recentBills = [...bills]
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 10);

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <Header title={"Báo cáo"} description={"Thống kê & phân tích"} />

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 4 }}>
        <CardContent className="p-4">
          <h2 className="text-lg mb-4">Doanh thu 6 tháng (triệu ₫)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value) => `${Number(value).toFixed(1)}tr`}
              />
              <Legend />
              <Line type="monotone" dataKey="Dự kiến" stroke="#6366f1" strokeWidth={3} />
              <Line type="monotone" dataKey="Đã thu" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 4 }}>
        <CardContent className="p-4">
          <h2 className="text-lg mb-4">Tình trạng phòng</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={roomStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {roomStatusData.map((item) => (
              <div key={item.name} className="p-3 bg-gray-50 rounded-xl text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: item.fill }}
                ></div>
                <p className="text-xs text-gray-600 mb-1">{item.name}</p>
                <p className="text-lg font-bold">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <CardContent className="p-4">
          <h2 className="text-lg mb-4">Hóa đơn gần đây</h2>

          <div className="space-y-3">
            {recentBills.map((bill) => {
              const electricTotal = (bill.electricCurrent - bill.electricPrevious) * bill.electricPrice;
              const waterTotal = (bill.waterCurrent - bill.waterPrevious) * bill.waterPrice;

              return (
                <div key={bill.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">Phòng {bill.roomNumber}</p>
                      <p className="text-xs text-gray-600">{bill.tenantName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{bill.total.toLocaleString('vi-VN')} ₫</p>
                      <p className="text-xs text-gray-600">T{bill.month.slice(5)}/{bill.month.slice(0, 4)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex gap-4 text-xs text-gray-600">
                      <span>Phòng: {(bill.roomPrice / 1000000).toFixed(1)}tr</span>
                      <span>Điện: {(electricTotal / 1000).toFixed(0)}k</span>
                      <span>Nước: {(waterTotal / 1000).toFixed(0)}k</span>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${bill.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {bill.paid ? 'Đã đóng' : 'Nợ'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
