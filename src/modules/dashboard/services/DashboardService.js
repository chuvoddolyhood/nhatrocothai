import { supabase } from "../../../supabase/config";
import { ROOMS, INVOICES, CONTRACTS } from "../../../supabase/DatabaseModel";
import { RoomStatus } from "../../room/constants/RoomStatus";
import { toCamelCase } from "../../../supabase/caseUtils";

export const DashboardService = {

    /**
     * Lấy tổng quan thống kê dashboard cho tháng hiện tại.
     * Trả về: totalRooms, occupiedRooms, emptyRooms, maintenanceRooms,
     *         paidThisMonth, unpaidThisMonth, expectedRevenue, actualRevenue,
     *         recentInvoices, monthlyRevenueChart
     */
    async getStats(month) {
        // Nếu không truyền month, dùng tháng hiện tại
        const targetMonth = month || new Date().toISOString().slice(0, 7); // "YYYY-MM"

        try {
            // 1. Lấy tất cả phòng (không ARCHIVED)
            const { data: roomsData, error: roomsError } = await supabase
                .from(ROOMS)
                .select("id, status, current_price, room_code")
                .neq("status", RoomStatus.ARCHIVED);

            if (roomsError) throw roomsError;

            const rooms = roomsData.map(r => toCamelCase(r));
            const totalRooms = rooms.length;
            const occupiedRooms = rooms.filter(r => r.status === RoomStatus.OCCUPIED).length;
            const emptyRooms = rooms.filter(r => r.status === RoomStatus.AVAILABLE).length;
            const maintenanceRooms = rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length;

            // 2. Lấy hóa đơn tháng hiện tại (không CANCELLED)
            const { data: invoicesData, error: invoicesError } = await supabase
                .from(INVOICES)
                .select(`
                    id, status, total_amount, room_id, month, room_code,
                    invoice_tenants (
                        tenants ( full_name )
                    )
                `)
                .eq("month", targetMonth)
                .neq("status", "CANCELLED")
                .order("created_at", { ascending: false });

            if (invoicesError) throw invoicesError;

            const invoices = invoicesData.map(row => {
                const mapped = toCamelCase(row);
                const tenant = row.invoice_tenants?.[0]?.tenants;
                mapped.tenantName = tenant?.full_name || '';
                delete mapped.invoiceTenants;
                return mapped;
            });

            const paidInvoices = invoices.filter(i => i.status === "PAID");
            const unpaidInvoices = invoices.filter(i => i.status === "UNPAID");

            const paidThisMonth = paidInvoices.length;
            const unpaidThisMonth = unpaidInvoices.length;

            const expectedRevenue = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
            const actualRevenue = paidInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

            // 3. Lấy 5 hóa đơn gần đây nhất (bao gồm tất cả tháng)
            const { data: recentRaw, error: recentError } = await supabase
                .from(INVOICES)
                .select(`
                    id, status, total_amount, room_code, month, room_id,
                    invoice_tenants (
                        tenants ( full_name )
                    )
                `)
                .neq("status", "CANCELLED")
                .order("created_at", { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            const recentInvoices = recentRaw.map(row => {
                const mapped = toCamelCase(row);
                const tenant = row.invoice_tenants?.[0]?.tenants;
                mapped.tenantName = tenant?.full_name || '';
                delete mapped.invoiceTenants;
                return mapped;
            });

            // 4. Lấy doanh thu 6 tháng gần đây cho biểu đồ
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                last6Months.push(d.toISOString().slice(0, 7));
            }

            const { data: chartRaw, error: chartError } = await supabase
                .from(INVOICES)
                .select("status, total_amount, month")
                .in("month", last6Months)
                .neq("status", "CANCELLED");

            if (chartError) throw chartError;

            const monthlyRevenueChart = last6Months.map(m => {
                const monthInvoices = chartRaw.filter(i => i.month === m);
                const expected = monthInvoices.reduce((s, i) => s + (i.total_amount || 0), 0);
                const actual = monthInvoices.filter(i => i.status === "PAID").reduce((s, i) => s + (i.total_amount || 0), 0);
                return {
                    month: `T${m.slice(5)}`,
                    fullMonth: m,
                    expected,
                    actual,
                };
            });

            // 5. Tổng điện/nước tháng hiện tại và tháng trước (từ invoices)
            const prevDate = new Date();
            prevDate.setMonth(prevDate.getMonth() - 1);
            const prevMonth = prevDate.toISOString().slice(0, 7);

            const { data: utilityRaw, error: utilityError } = await supabase
                .from(INVOICES)
                .select("month, electric_usage, water_usage")
                .in("month", [targetMonth, prevMonth])
                .neq("status", "CANCELLED");

            if (utilityError) throw utilityError;

            const currentUtility = utilityRaw.filter(i => i.month === targetMonth);
            const prevUtility = utilityRaw.filter(i => i.month === prevMonth);

            const totalElectric = currentUtility.reduce((s, i) => s + (i.electric_usage || 0), 0);
            const totalWater = currentUtility.reduce((s, i) => s + (i.water_usage || 0), 0);
            const prevTotalElectric = prevUtility.reduce((s, i) => s + (i.electric_usage || 0), 0);
            const prevTotalWater = prevUtility.reduce((s, i) => s + (i.water_usage || 0), 0);

            // 6. Tổng số khách đang thuê (từ contracts ACTIVE)
            const { data: contractsRaw, error: contractsError } = await supabase
                .from(CONTRACTS)
                .select("id, contract_tenants ( tenant_id )")
                .eq("status", "ACTIVE");

            if (contractsError) throw contractsError;

            const totalTenants = contractsRaw.reduce((sum, c) => {
                return sum + (c.contract_tenants?.length || 0);
            }, 0);

            return {
                success: true,
                data: {
                    targetMonth,
                    totalRooms,
                    occupiedRooms,
                    emptyRooms,
                    maintenanceRooms,
                    paidThisMonth,
                    unpaidThisMonth,
                    expectedRevenue,
                    actualRevenue,
                    recentInvoices,
                    monthlyRevenueChart,
                    totalElectric,
                    totalWater,
                    prevTotalElectric,
                    prevTotalWater,
                    totalTenants,
                }
            };
        } catch (error) {
            console.error("Lỗi khi lấy thống kê dashboard:", error);
            return { success: false, error: error.message };
        }
    },
};
