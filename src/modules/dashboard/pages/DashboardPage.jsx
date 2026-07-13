import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';
import {
  Home, Users, DollarSign, TrendingUp, AlertCircle,
  CheckCircle2, XCircle, ChevronLeft, ChevronRight,
  RefreshCw, Wrench, CalendarCheck
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import CardDashBoard from '../components/CardDashBoard';
import ProgressBarDashboard from '../components/ProgressBarDashboard';
import RevenueRow from '../components/RevenueRow';
import { DashboardService } from '../services/DashboardService';
import { useNotification } from '../../../shared/hooks/useNotification';

// ─────────────────────────────────────────────────────────
// Helper: lấy tháng theo offset so với hôm nay
// ─────────────────────────────────────────────────────────
const getMonthOffset = (offset = 0) => {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7); // "YYYY-MM"
};

const formatMonthLabel = (month) => {
  const [year, m] = month.split('-');
  return `Tháng ${parseInt(m)}/${year}`;
};

const formatCurrency = (val) =>
  val != null ? val.toLocaleString('vi-VN') + ' ₫' : '—';

// ─────────────────────────────────────────────────────────
// Custom Tooltip cho AreaChart
// ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        fontSize: '13px',
      }}>
        <p style={{ fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
            {entry.name}: {(entry.value / 1_000_000).toFixed(2)}tr ₫
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────────────────
// Skeleton loader cho stat card
// ─────────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <Card sx={{ borderRadius: '16px', overflow: 'hidden' }}>
    <Skeleton variant="rectangular" height={90} animation="wave" />
  </Card>
);

// ─────────────────────────────────────────────────────────
// Recent Invoice Item
// ─────────────────────────────────────────────────────────
const RecentInvoiceItem = ({ invoice }) => {
  const isPaid = invoice.status === 'PAID';
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 14px',
      borderRadius: '12px',
      background: isPaid ? '#f0fdf4' : '#fff7ed',
      marginBottom: '8px',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isPaid
          ? <CheckCircle2 size={18} color="#16a34a" />
          : <XCircle size={18} color="#ea580c" />
        }
        <div>
          <p style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937', margin: 0 }}>
            Phòng {invoice.roomCode || invoice.roomId}
          </p>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
            {invoice.tenantName || 'Không rõ'} &bull; T{invoice.month?.slice(5)}/{invoice.month?.slice(0, 4)}
          </p>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{
          fontWeight: 700, fontSize: '14px',
          color: isPaid ? '#16a34a' : '#ea580c', margin: 0
        }}>
          {formatCurrency(invoice.totalAmount)}
        </p>
        <span style={{
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '99px',
          background: isPaid ? '#dcfce7' : '#ffedd5',
          color: isPaid ? '#15803d' : '#c2410c',
          display: 'inline-block',
          marginTop: 2,
        }}>
          {isPaid ? 'Đã thu' : 'Còn nợ'}
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Main DashboardPage
// ─────────────────────────────────────────────────────────
export function DashboardPage({ setHeaderConfig }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const { showError } = useNotification();

  const currentMonth = getMonthOffset(monthOffset);
  const isCurrentMonth = monthOffset === 0;

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await DashboardService.getStats(currentMonth);
      if (res.success) {
        setStats(res.data);
        if (setHeaderConfig) {
          setHeaderConfig({
            title: 'Tổng quan',
            description: formatMonthLabel(currentMonth),
          });
        }
      } else {
        showError(res.error || 'Không thể tải dữ liệu');
      }
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const cardStyle = {
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
  };

  // ── Build stat cards ──────────────────────────────────
  const dashboardItems = stats ? [
    {
      bgGradient: 'from-indigo-500 to-purple-600',
      icon: Home,
      title: 'Tổng phòng',
      value: stats.totalRooms,
    },
    {
      bgGradient: 'from-green-500 to-emerald-600',
      icon: Users,
      title: 'Đang thuê',
      value: stats.occupiedRooms,
    },
    {
      bgGradient: 'from-orange-400 to-amber-500',
      icon: AlertCircle,
      title: 'Phòng trống',
      value: stats.emptyRooms,
    },
    {
      bgGradient: 'from-blue-500 to-cyan-500',
      icon: stats.maintenanceRooms > 0 ? Wrench : TrendingUp,
      title: stats.maintenanceRooms > 0 ? 'Bảo trì' : 'Tỷ lệ thu',
      value: stats.maintenanceRooms > 0
        ? stats.maintenanceRooms
        : `${stats.occupiedRooms > 0
          ? Math.round((stats.paidThisMonth / stats.occupiedRooms) * 100)
          : 0}%`,
    },
  ] : [];

  const revenueRows = stats ? [
    {
      label: 'Dự kiến',
      value: stats.expectedRevenue,
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-600',
    },
    {
      label: 'Đã thu',
      value: stats.actualRevenue,
      bgClass: 'bg-green-50',
      textClass: 'text-green-700',
    },
    {
      label: 'Còn nợ',
      value: stats.expectedRevenue - stats.actualRevenue,
      bgClass: 'bg-red-50',
      textClass: 'text-red-700',
    },
  ] : [];

  const paymentStatusItems = stats ? [
    {
      label: 'Đã đóng tiền',
      value: stats.paidThisMonth,
      gradient: 'bg-gradient-to-r from-green-400 to-emerald-500',
    },
    {
      label: 'Chưa đóng tiền',
      value: stats.unpaidThisMonth,
      gradient: 'bg-gradient-to-r from-orange-400 to-red-500',
    },
  ] : [];

  // ── Render ────────────────────────────────────────────
  return (
    <div className="p-4 pb-24 bg-linear-to-r from-indigo-50 via-white to-purple-50 min-h-screen">

      {/* ── Month Selector ── */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '14px',
        padding: '0 14px',
        height: '60px',
        boxShadow: '0 2px 10px rgba(99,102,241,0.08)',
        backdropFilter: 'blur(8px)',
      }}>
        {/* Left: prev + back-to-today */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setMonthOffset(o => o - 1)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              color: '#6366f1', padding: '4px',
            }}
          >
            <ChevronLeft size={22} />
          </button>

          {/* Back to current month button */}
          {!isCurrentMonth && (
            <button
              onClick={() => setMonthOffset(0)}
              title="Về tháng hiện tại"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: 'white',
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                transition: 'opacity 0.2s',
              }}
            >
              <CalendarCheck size={14} />
            </button>
          )}
        </div>

        {/* Center text – always truly centered via absolute positioning */}
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', margin: 0, whiteSpace: 'nowrap' }}>
            {formatMonthLabel(currentMonth)}
          </p>
          <p style={{ fontSize: '11px', color: '#6366f1', margin: 0 }}>
            {isCurrentMonth ? "Tháng hiện tại" : "Các tháng trước"}
          </p>
        </div>

        {/* Right: refresh + next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Refresh button */}
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            title="Làm mới dữ liệu"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              color: refreshing ? '#c4b5fd' : '#6366f1',
              padding: '4px',
              transition: 'color 0.2s',
            }}
          >
            <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          <button
            onClick={() => setMonthOffset(o => Math.min(0, o + 1))}
            disabled={isCurrentMonth}
            style={{
              background: 'none', border: 'none',
              cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center',
              color: isCurrentMonth ? '#c4b5fd' : '#6366f1',
              padding: '4px',
            }}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {loading
          ? [1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)
          : dashboardItems.map((item) => (
            <CardDashBoard key={item.title} {...item} />
          ))
        }
      </div>

      {/* ── Revenue Summary ── */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: '16px !important' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2 text-gray-800">
              <DollarSign size={18} className="text-indigo-500" />
              Doanh thu {formatMonthLabel(currentMonth)}
            </h2>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton variant="rounded" height={44} animation="wave" />
              <Skeleton variant="rounded" height={44} animation="wave" />
              <Skeleton variant="rounded" height={44} animation="wave" />
            </div>
          ) : (
            <div className="space-y-2">
              {revenueRows.map((item) => (
                <RevenueRow key={item.label} {...item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Payment Status ── */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: '16px !important' }}>
          <h2 className="text-base font-semibold mb-4 text-gray-800">
            Tình trạng thanh toán
          </h2>

          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="rounded" height={40} animation="wave" />
              <Skeleton variant="rounded" height={40} animation="wave" />
            </div>
          ) : (
            <div className="space-y-4">
              {paymentStatusItems.map((item) => (
                <ProgressBarDashboard
                  key={item.label}
                  total={stats.occupiedRooms}
                  {...item}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Revenue Chart (6 months) ── */}
      <Card sx={{ ...cardStyle, mb: 3 }}>
        <CardContent sx={{ p: '16px !important' }}>
          <h2 className="text-base font-semibold mb-4 text-gray-800">
            Xu hướng doanh thu 6 tháng
          </h2>

          {loading ? (
            <Skeleton variant="rounded" height={200} animation="wave" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart
                data={stats.monthlyRevenueChart}
                margin={{ top: 5, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradExpected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}tr`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="expected"
                  name="Dự kiến"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#gradExpected)"
                  dot={{ r: 3, fill: '#6366f1' }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Đã thu"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gradActual)"
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Recent Invoices ── */}
      <Card sx={{ ...cardStyle }}>
        <CardContent sx={{ p: '16px !important' }}>
          <h2 className="text-base font-semibold mb-4 text-gray-800">
            Hóa đơn gần đây
          </h2>

          {loading ? (
            <div>
              {[1, 2, 3].map(i => (
                <Skeleton key={i} variant="rounded" height={58} animation="wave" sx={{ mb: 1 }} />
              ))}
            </div>
          ) : stats.recentInvoices.length === 0 ? (
            <div style={{
              textAlign: 'center', color: '#9ca3af',
              padding: '24px 0', fontSize: '14px',
            }}>
              Chưa có hóa đơn nào
            </div>
          ) : (
            <div>
              {stats.recentInvoices.map(inv => (
                <RecentInvoiceItem key={inv.id} invoice={inv} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSS cho spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
