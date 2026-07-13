import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, Skeleton, Chip } from '@mui/material';
import {
    BarChart3, TrendingUp, Home, Users, AlertCircle, Wrench,
    DollarSign, CheckCircle2, XCircle, Clock, RefreshCw,
    ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
    BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { ReportingService } from '../services/ReportingService';
import { useNotification } from '../../../shared/hooks/useNotification';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
const fmt = (val) =>
    val != null ? val.toLocaleString('vi-VN') + ' ₫' : '—';

const fmtShort = (val) => {
    if (val == null) return '—';
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}tr`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val.toLocaleString('vi-VN');
};

const formatMonthFull = (m) => {
    if (!m) return '';
    const [y, mo] = m.split('-');
    return `T${parseInt(mo)}/${y}`;
};

// ─────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(255,255,255,0.97)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            fontSize: '12px',
            minWidth: 140,
        }}>
            <p style={{ fontWeight: 700, color: '#374151', marginBottom: 6, fontSize: 13 }}>{label}</p>
            {payload.map((e) => (
                <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, margin: '3px 0', color: e.color }}>
                    <span>{e.name}</span>
                    <span style={{ fontWeight: 600 }}>{fmtShort(e.value)}</span>
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color = '#6366f1', loading }) => (
    <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(99,102,241,0.08)', overflow: 'hidden' }}>
        {loading ? (
            <Skeleton variant="rectangular" height={88} animation="wave" />
        ) : (
            <div style={{
                padding: '14px 16px',
                borderLeft: `4px solid ${color}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                        background: `${color}18`,
                        borderRadius: 8,
                        padding: 5,
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <Icon size={15} color={color} />
                    </div>
                    <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>{label}</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#1f2937', margin: 0, lineHeight: 1.2 }}>{value}</p>
                {sub && <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{sub}</p>}
            </div>
        )}
    </Card>
);

// ─────────────────────────────────────────────────────────
// Overdue Invoice Row
// ─────────────────────────────────────────────────────────
const OverdueRow = ({ invoice }) => (
    <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: '10px',
        background: '#fff7ed',
        marginBottom: 6,
        gap: 8,
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={15} color="#ea580c" />
            <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
                    Phòng {invoice.roomCode || invoice.roomId}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>
                    {invoice.tenantName || '—'} · {formatMonthFull(invoice.month)}
                </p>
            </div>
        </div>
        <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#dc2626' }}>
                {fmt(invoice.totalAmount)}
            </p>
            <span style={{
                fontSize: 10, padding: '1px 7px',
                background: '#fee2e2', color: '#b91c1c',
                borderRadius: 99, display: 'inline-block', marginTop: 2,
            }}>
                Quá hạn
            </span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────
// Room Stat Row
// ─────────────────────────────────────────────────────────
const RoomStatRow = ({ room, rank }) => {
    const rate = room.collectionRate;
    const rateColor = rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626';
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 0',
            borderBottom: '1px solid #f3f4f6',
        }}>
            <span style={{
                minWidth: 24, height: 24,
                background: rank <= 3 ? '#6366f1' : '#f3f4f6',
                color: rank <= 3 ? 'white' : '#6b7280',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
            }}>
                {rank}
            </span>
            <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
                    Phòng {room.roomCode}
                </p>
                <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                    {/* Mini progress bar */}
                    <div style={{ flex: 1, background: '#e5e7eb', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                        <div style={{
                            width: `${rate}%`,
                            height: '100%',
                            background: rateColor,
                            borderRadius: 99,
                            transition: 'width 0.5s ease',
                        }} />
                    </div>
                    <span style={{ fontSize: 10, color: rateColor, fontWeight: 700, minWidth: 30 }}>
                        {rate}%
                    </span>
                </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 70 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#1f2937' }}>
                    {fmtShort(room.actual6m)}
                </p>
                {room.unpaidCount > 0 && (
                    <span style={{
                        fontSize: 10, padding: '1px 6px',
                        background: '#fee2e2', color: '#b91c1c',
                        borderRadius: 99, display: 'inline-block', marginTop: 2,
                    }}>
                        {room.unpaidCount} nợ
                    </span>
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// Section Title
// ─────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, title, subtitle, color = '#6366f1' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
            background: `${color}18`, borderRadius: 8,
            padding: 6, display: 'flex', alignItems: 'center',
        }}>
            <Icon size={16} color={color} />
        </div>
        <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1f2937' }}>{title}</p>
            {subtitle && <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{subtitle}</p>}
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────
// Main ReportingPage
// ─────────────────────────────────────────────────────────
export function ReportingPage({ setHeaderConfig }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { showError } = useNotification();

    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const res = await ReportingService.getReportData();
            if (res.success) {
                setData(res.data);
                if (setHeaderConfig) {
                    setHeaderConfig({ title: 'Báo cáo', description: 'Thống kê & phân tích' });
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
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const cardStyle = { borderRadius: '16px', boxShadow: '0 4px 20px rgba(99,102,241,0.08)' };

    // Chỉ lấy 6 tháng gần nhất cho bar chart
    const chartData6 = data?.revenueChart?.slice(-6) ?? [];
    const chartData12 = data?.revenueChart ?? [];

    // Màu cho bars
    const BAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return (
        <div className="p-4 pb-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">

            {/* ── Header Bar ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                background: 'rgba(255,255,255,0.8)',
                borderRadius: 14,
                padding: '12px 16px',
                boxShadow: '0 2px 10px rgba(99,102,241,0.08)',
                backdropFilter: 'blur(8px)',
            }}>
                <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#1f2937' }}>Báo cáo tổng hợp</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#6366f1' }}>12 tháng gần nhất</p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    title="Làm mới"
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: refreshing ? '#c4b5fd' : '#6366f1',
                        display: 'flex', alignItems: 'center', padding: 4,
                    }}
                >
                    <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                </button>
            </div>

            {/* ── KPI Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <KpiCard
                    loading={loading}
                    icon={Home}
                    label="Tổng phòng"
                    value={data?.totalRooms ?? '—'}
                    sub={`${data?.occupiedRooms ?? 0} đang thuê · ${data?.emptyRooms ?? 0} trống`}
                    color="#6366f1"
                />
                <KpiCard
                    loading={loading}
                    icon={TrendingUp}
                    label="Tỷ lệ lấp đầy"
                    value={data ? `${data.occupancyRate}%` : '—'}
                    sub={`${data?.maintenanceRooms ?? 0} phòng bảo trì`}
                    color="#10b981"
                />
                <KpiCard
                    loading={loading}
                    icon={DollarSign}
                    label="Đã thu (6 tháng)"
                    value={data ? fmtShort(data.totalActual6) : '—'}
                    sub={`Tỷ lệ thu: ${data?.collectionRate6 ?? 0}%`}
                    color="#8b5cf6"
                />
                <KpiCard
                    loading={loading}
                    icon={AlertCircle}
                    label="Còn nợ (6 tháng)"
                    value={data ? fmtShort(data.totalUnpaid6) : '—'}
                    sub={`${data?.overdueInvoices?.length ?? 0} hóa đơn quá hạn`}
                    color="#f59e0b"
                />
            </div>

            {/* ── Biểu đồ doanh thu 12 tháng (Area) ── */}
            <Card sx={{ ...cardStyle, mb: 2 }}>
                <CardContent sx={{ p: '16px !important' }}>
                    <SectionTitle
                        icon={TrendingUp}
                        title="Xu hướng doanh thu"
                        subtitle="12 tháng gần nhất"
                        color="#6366f1"
                    />
                    {loading ? (
                        <Skeleton variant="rounded" height={200} animation="wave" />
                    ) : (
                        <ResponsiveContainer width="100%" height={210}>
                            <AreaChart data={chartData12} margin={{ top: 5, right: 4, left: -22, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="rg-exp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="rg-act" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    axisLine={false} tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    axisLine={false} tickLine={false}
                                    tickFormatter={v => `${(v / 1_000_000).toFixed(0)}tr`}
                                />
                                <Tooltip content={<RevenueTooltip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                <Area type="monotone" dataKey="expected" name="Dự kiến"
                                    stroke="#6366f1" strokeWidth={2} fill="url(#rg-exp)"
                                    dot={{ r: 2, fill: '#6366f1' }}
                                />
                                <Area type="monotone" dataKey="actual" name="Đã thu"
                                    stroke="#10b981" strokeWidth={2} fill="url(#rg-act)"
                                    dot={{ r: 2, fill: '#10b981' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* ── Biểu đồ cột – so sánh 6 tháng ── */}
            <Card sx={{ ...cardStyle, mb: 2 }}>
                <CardContent sx={{ p: '16px !important' }}>
                    <SectionTitle
                        icon={BarChart3}
                        title="So sánh thu thực tế vs nợ"
                        subtitle="6 tháng gần nhất"
                        color="#8b5cf6"
                    />
                    {loading ? (
                        <Skeleton variant="rounded" height={180} animation="wave" />
                    ) : (
                        <ResponsiveContainer width="100%" height={190}>
                            <BarChart data={chartData6} margin={{ top: 5, right: 4, left: -22, bottom: 0 }} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    axisLine={false} tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                    axisLine={false} tickLine={false}
                                    tickFormatter={v => `${(v / 1_000_000).toFixed(0)}tr`}
                                />
                                <Tooltip content={<RevenueTooltip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="actual" name="Đã thu" fill="#10b981" radius={[5, 5, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="unpaid" name="Còn nợ" fill="#f87171" radius={[5, 5, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>

            {/* ── Tình trạng phòng ── */}
            <Card sx={{ ...cardStyle, mb: 2 }}>
                <CardContent sx={{ p: '16px !important' }}>
                    <SectionTitle
                        icon={Home}
                        title="Tình trạng phòng"
                        subtitle={`${data?.totalRooms ?? 0} phòng tổng`}
                        color="#10b981"
                    />
                    {loading ? (
                        <Skeleton variant="rounded" height={80} animation="wave" />
                    ) : (
                        <>
                            {/* Occupancy bar */}
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>Tỷ lệ lấp đầy</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>{data.occupancyRate}%</span>
                                </div>
                                <div style={{ background: '#e5e7eb', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${data.occupancyRate}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #6366f1, #10b981)',
                                        borderRadius: 99,
                                        transition: 'width 0.6s ease',
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                {[
                                    { label: 'Đang thuê', value: data.occupiedRooms, color: '#6366f1', bg: '#eef2ff' },
                                    { label: 'Trống', value: data.emptyRooms, color: '#f59e0b', bg: '#fffbeb' },
                                    { label: 'Bảo trì', value: data.maintenanceRooms, color: '#ef4444', bg: '#fef2f2' },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        background: item.bg,
                                        borderRadius: 12, padding: '10px 8px',
                                        textAlign: 'center',
                                    }}>
                                        <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: item.color }}>{item.value}</p>
                                        <p style={{ margin: 0, fontSize: 10, color: '#6b7280' }}>{item.label}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ── Hóa đơn quá hạn ── */}
            <Card sx={{ ...cardStyle, mb: 2 }}>
                <CardContent sx={{ p: '16px !important' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <SectionTitle icon={Clock} title="Hóa đơn quá hạn" color="#ef4444" />
                        {!loading && data?.overdueInvoices?.length > 0 && (
                            <Chip
                                label={`${data.overdueInvoices.length} hóa đơn`}
                                size="small"
                                sx={{
                                    background: '#fee2e2', color: '#b91c1c',
                                    fontWeight: 700, fontSize: 11,
                                    borderRadius: '8px',
                                }}
                            />
                        )}
                    </div>

                    {loading ? (
                        [1, 2, 3].map(i => (
                            <Skeleton key={i} variant="rounded" height={56} animation="wave" sx={{ mb: 1 }} />
                        ))
                    ) : data.overdueInvoices.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '20px 0',
                            color: '#9ca3af', fontSize: 13,
                        }}>
                            <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: 6 }} />
                            <p style={{ margin: 0 }}>Không có hóa đơn quá hạn!</p>
                        </div>
                    ) : (
                        <div>
                            {data.overdueInvoices.map(inv => (
                                <OverdueRow key={inv.id} invoice={inv} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Thống kê thu tiền theo phòng (6 tháng) ── */}
            <Card sx={{ ...cardStyle }}>
                <CardContent sx={{ p: '16px !important' }}>
                    <SectionTitle
                        icon={BarChart3}
                        title="Thu tiền theo phòng"
                        subtitle="6 tháng · sắp xếp theo nợ"
                        color="#8b5cf6"
                    />
                    {loading ? (
                        [1, 2, 3, 4].map(i => (
                            <Skeleton key={i} variant="rounded" height={48} animation="wave" sx={{ mb: 1 }} />
                        ))
                    ) : data.roomStats.length === 0 ? (
                        <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                            Chưa có dữ liệu
                        </p>
                    ) : (
                        <div>
                            {data.roomStats.map((room, idx) => (
                                <RoomStatRow key={room.id} room={room} rank={idx + 1} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CSS spin */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
