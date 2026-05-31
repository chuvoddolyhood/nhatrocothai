import { Card, CardContent } from '@mui/material';
import { Home, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import Header from '../../../shared/components/ui/Header';
import CardDashBoard from '../components/CardDashBoard';
import ProgressBarDashboard from '../components/ProgressBarDashboard';
import RevenueRow from '../components/RevenueRow';

export function DashboardPage({ stats }) {
  const { totalRooms, occupiedRooms, emptyRooms, paidThisMonth, unpaidThisMonth, expectedRevenue, actualRevenue } = stats;

  const collectionRate = occupiedRooms > 0 ? Math.round((paidThisMonth / occupiedRooms) * 100) : 0;

  const dashboardItems = [{
    bgGradient: 'from-indigo-500 to-purple-600',
    icon: Home,
    title: 'Tổng phòng',
    value: totalRooms
  },
  {
    bgGradient: 'from-green-500 to-emerald-600',
    icon: Users,
    title: 'Đang thuê',
    value: occupiedRooms
  },
  {
    bgGradient: 'from-orange-400 to-pink-500',
    icon: AlertCircle,
    title: 'Phòng trống',
    value: emptyRooms
  },
  {
    bgGradient: 'from-blue-500 to-cyan-600',
    icon: TrendingUp,
    title: 'Tỷ lệ thu',
    value: `${collectionRate}%`
  }
  ]

  const revenueRows = [
    {
      label: 'Dự kiến',
      value: expectedRevenue,
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-600',
    },
    {
      label: 'Đã thu',
      value: actualRevenue,
      bgClass: 'bg-green-50',
      textClass: 'text-green-700',
    },
    {
      label: 'Còn nợ',
      value: expectedRevenue - actualRevenue,
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
    },
  ];

  const paymentStatusItems = [
    {
      label: 'Đã đóng tiền',
      value: paidThisMonth,
      gradient: 'bg-gradient-to-r from-green-400 to-emerald-500',
    },
    {
      label: 'Chưa đóng tiền',
      value: unpaidThisMonth,
      gradient: 'bg-gradient-to-r from-red-400 to-pink-500',
    },
  ];

  const cardStyle = {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  };

  return (
    <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <Header title={"Xin chào!"} description={"Tổng quan tình hình nhà trọ"} />

      <div className="grid grid-cols-2 gap-3 mb-6">
        {dashboardItems.map((item) => (
          <CardDashBoard
            key={item.title}
            {...item}
          />
        ))}
      </div>

      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg flex items-center gap-2">
              <DollarSign size={20} className="text-indigo-600" />
              Doanh thu tháng này
            </h2>
          </div>

          <div className="space-y-3">
            {revenueRows.map((item) => (
              <RevenueRow
                key={item.label}
                {...item}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card sx={{ ...cardStyle }}>
        <CardContent className="p-4">
          <h2 className="text-lg mb-4">Tình trạng thanh toán</h2>

          <div className="space-y-4">
            {paymentStatusItems.map((item) => (
              <ProgressBarDashboard
                key={item.label}
                total={occupiedRooms}
                {...item}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
