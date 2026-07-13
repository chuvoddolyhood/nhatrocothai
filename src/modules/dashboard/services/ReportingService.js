import { supabase } from "../../../supabase/config";
import { ROOMS, INVOICES } from "../../../supabase/DatabaseModel";
import { RoomStatus } from "../../room/constants/RoomStatus";
import { toCamelCase } from "../../../supabase/caseUtils";

// ─────────────────────────────────────────────────────────
// Helper: sinh danh sách N tháng gần nhất (format YYYY-MM)
// ─────────────────────────────────────────────────────────
const getLastNMonths = (n = 12) => {
    const months = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        months.push(d.toISOString().slice(0, 7));
    }
    return months;
};

export const ReportingService = {

    // ─────────────────────────────────────────────────────────
    // Báo cáo tổng hợp cho trang Báo cáo
    // ─────────────────────────────────────────────────────────
    async getReportData() {
        try {
            const months12 = getLastNMonths(12);
            const months6 = months12.slice(6); // 6 tháng gần nhất

            // 1. Tất cả phòng (không ARCHIVED)
            const { data: roomsRaw, error: roomsErr } = await supabase
                .from(ROOMS)
                .select("id, room_code, status, current_price, floor")
                .neq("status", RoomStatus.ARCHIVED)
                .order("room_code", { ascending: true });
            if (roomsErr) throw roomsErr;
            const rooms = roomsRaw.map(r => toCamelCase(r));

            // 2. Tất cả hóa đơn trong 12 tháng gần nhất
            const { data: invoicesRaw, error: invoicesErr } = await supabase
                .from(INVOICES)
                .select(`
                    id, status, total_amount, month, room_id, room_code,
                    invoice_tenants (
                        tenants ( full_name )
                    )
                `)
                .in("month", months12)
                .neq("status", "CANCELLED")
                .order("month", { ascending: true });
            if (invoicesErr) throw invoicesErr;

            const invoices = invoicesRaw.map(row => {
                const mapped = toCamelCase(row);
                const tenant = row.invoice_tenants?.[0]?.tenants;
                mapped.tenantName = tenant?.full_name || '';
                delete mapped.invoiceTenants;
                return mapped;
            });

            // ── 3. Biểu đồ doanh thu 12 tháng ──────────────────
            const revenueChart = months12.map(m => {
                const monthInvoices = invoices.filter(i => i.month === m);
                const expected = monthInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
                const actual = monthInvoices
                    .filter(i => i.status === "PAID")
                    .reduce((s, i) => s + (i.totalAmount || 0), 0);
                const unpaid = expected - actual;
                const label = `T${m.slice(5)}/${m.slice(2, 4)}`;
                return { month: m, label, expected, actual, unpaid };
            });

            // ── 4. Tổng quan phòng ──────────────────────────────
            const totalRooms = rooms.length;
            const occupiedRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
            const emptyRooms = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
            const maintenanceRooms = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;
            const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

            // ── 5. Thống kê 6 tháng tích lũy ────────────────────
            const last6Invoices = invoices.filter(i => months6.includes(i.month));
            const totalExpected6 = last6Invoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
            const totalActual6 = last6Invoices.filter(i => i.status === "PAID").reduce((s, i) => s + (i.totalAmount || 0), 0);
            const totalUnpaid6 = totalExpected6 - totalActual6;
            const collectionRate6 = totalExpected6 > 0 ? Math.round((totalActual6 / totalExpected6) * 100) : 0;

            // ── 6. Hóa đơn quá hạn (UNPAID tháng cũ hơn tháng hiện tại) ──
            const currentMonth = new Date().toISOString().slice(0, 7);
            const overdueInvoices = invoices
                .filter(i => i.status === "UNPAID" && i.month < currentMonth)
                .sort((a, b) => a.month.localeCompare(b.month));

            // ── 7. Thống kê theo phòng (6 tháng) ────────────────
            const roomStats = rooms.map(room => {
                const roomInvoices = last6Invoices.filter(i => i.roomId === room.id);
                const expected = roomInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0);
                const actual = roomInvoices.filter(i => i.status === "PAID").reduce((s, i) => s + (i.totalAmount || 0), 0);
                const unpaidCount = roomInvoices.filter(i => i.status === "UNPAID").length;
                return {
                    ...room,
                    expected6m: expected,
                    actual6m: actual,
                    unpaidCount,
                    collectionRate: expected > 0 ? Math.round((actual / expected) * 100) : 0,
                };
            }).sort((a, b) => b.unpaidCount - a.unpaidCount || b.expected6m - a.expected6m);

            // ── 8. Phân bổ doanh thu tháng hiện tại theo phòng ──
            const currentMonthInvoices = invoices.filter(i => i.month === currentMonth);
            const roomRevenueBreakdown = currentMonthInvoices.map(inv => ({
                roomCode: inv.roomCode || String(inv.roomId),
                tenantName: inv.tenantName,
                totalAmount: inv.totalAmount,
                status: inv.status,
            })).sort((a, b) => b.totalAmount - a.totalAmount);

            return {
                success: true,
                data: {
                    // Charts
                    revenueChart,
                    // Summary KPIs
                    totalRooms,
                    occupiedRooms,
                    emptyRooms,
                    maintenanceRooms,
                    occupancyRate,
                    // 6-month aggregates
                    totalExpected6,
                    totalActual6,
                    totalUnpaid6,
                    collectionRate6,
                    // Lists
                    overdueInvoices,
                    roomStats,
                    roomRevenueBreakdown,
                    currentMonth,
                },
            };
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu báo cáo:", error);
            return { success: false, error: error.message };
        }
    },
};
