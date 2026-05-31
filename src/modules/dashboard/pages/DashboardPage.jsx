import { Card, CardContent } from '@mui/material';
import { Home, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export function DashboardPage({ stats }) {
  const collectionRate = stats.occupiedRooms > 0
    ? Math.round((stats.paidThisMonth / stats.occupiedRooms) * 100)
    : 0;

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl mb-1">Xin chào!</h1>
        <p className="text-gray-600 text-sm">Tổng quan tình hình nhà trọ</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="overflow-hidden" sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Home size={20} />
              <span className="text-xs opacity-90">Tổng phòng</span>
            </div>
            <p className="text-3xl">{stats.totalRooms}</p>
          </div>
        </Card>

        <Card className="overflow-hidden" sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Users size={20} />
              <span className="text-xs opacity-90">Đang thuê</span>
            </div>
            <p className="text-3xl">{stats.occupiedRooms}</p>
          </div>
        </Card>

        <Card className="overflow-hidden" sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} />
              <span className="text-xs opacity-90">Phòng trống</span>
            </div>
            <p className="text-3xl">{stats.emptyRooms}</p>
          </div>
        </Card>

        <Card className="overflow-hidden" sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} />
              <span className="text-xs opacity-90">Tỷ lệ thu</span>
            </div>
            <p className="text-3xl">{collectionRate}%</p>
          </div>
        </Card>
      </div>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg flex items-center gap-2">
              <DollarSign size={20} className="text-indigo-600" />
              Doanh thu tháng này
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-600">Dự kiến:</span>
              <span className="font-medium text-base">{stats.expectedRevenue.toLocaleString('vi-VN')} ₫</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
              <span className="text-sm text-green-700">Đã thu:</span>
              <span className="font-medium text-base text-green-700">{stats.actualRevenue.toLocaleString('vi-VN')} ₫</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
              <span className="text-sm text-red-700">Còn nợ:</span>
              <span className="font-medium text-base text-red-700">{(stats.expectedRevenue - stats.actualRevenue).toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <CardContent className="p-4">
          <h2 className="text-lg mb-4">Tình trạng thanh toán</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Đã đóng tiền</span>
                <span className="font-medium">{stats.paidThisMonth}/{stats.occupiedRooms} phòng</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.paidThisMonth / stats.occupiedRooms) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Chưa đóng tiền</span>
                <span className="font-medium">{stats.unpaidThisMonth}/{stats.occupiedRooms} phòng</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-400 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.unpaidThisMonth / stats.occupiedRooms) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
