import { supabase } from "../../../supabase/config";
import { toCamelCase } from "../../../supabase/caseUtils";
import {
    INVOICES,
    INVOICE_TENANTS,
    PAYMENTS,
    METER_READINGS,
    UTILITY_PRICES,
    CONTRACTS,
} from "../../../supabase/DatabaseModel";

export const InvoiceService = {

    // ─────────────────────────────────────────────────────────
    // Lấy danh sách hóa đơn (có thể lọc theo month, status, roomId)
    // ─────────────────────────────────────────────────────────
    async getInvoices(filters = {}) {
        try {
            let query = supabase
                .from(INVOICES)
                .select(`
                    *,
                    invoice_tenants (
                        tenants ( full_name )
                    )
                `)
                .neq("status", "CANCELLED")
                .order("created_at", { ascending: false });

            if (filters.month) {
                query = query.eq("month", filters.month);
            }
            if (filters.status) {
                query = query.eq("status", filters.status);
            }
            if (filters.roomId) {
                query = query.eq("room_id", filters.roomId);
            }
            if (filters.contractId) {
                query = query.eq("contract_id", filters.contractId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return {
                success: true,
                data: data.map(row => {
                    const mapped = toCamelCase(row);
                    // Extract tenant name from joined table
                    const tenant = row.invoice_tenants?.[0]?.tenants;
                    mapped.representativeTenantName = tenant?.full_name || '';
                    delete mapped.invoiceTenants;
                    console.log(mapped);

                    return mapped;
                })
            };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hóa đơn:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Lấy chi tiết một hóa đơn
    // ─────────────────────────────────────────────────────────
    async getInvoiceById(invoiceId) {
        try {
            const { data, error } = await supabase
                .from(INVOICES)
                .select(`
                    *,
                    invoice_tenants (
                        tenants ( full_name )
                    )
                `)
                .eq("id", invoiceId)
                .single();

            if (error) throw error;

            const mapped = toCamelCase(data);
            const tenant = data.invoice_tenants?.[0]?.tenants;
            mapped.representativeTenantName = tenant?.full_name || '';
            delete mapped.invoiceTenants;

            return { success: true, data: mapped };
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Tạo hóa đơn mới (và lưu meter_readings)
    // ─────────────────────────────────────────────────────────
    async createInvoice(invoiceData) {
        try {
            const newInvoice = {
                property_id: invoiceData.propertyId || null,
                room_id: invoiceData.roomId || null,
                contract_id: invoiceData.contractId || null,
                month: invoiceData.month,
                room_fee: Number(invoiceData.roomFee) || 0,
                electric_price: Number(invoiceData.electricPrice) || 0,
                electric_usage: Number(invoiceData.electricUsage) || 0,
                electric_fee: Number(invoiceData.electricFee) || 0,
                water_price: Number(invoiceData.waterPrice) || 0,
                water_usage: Number(invoiceData.waterUsage) || 0,
                water_fee: Number(invoiceData.waterFee) || 0,
                internet_fee: Number(invoiceData.internetFee) || 0,
                service_fee: Number(invoiceData.serviceFee) || 0,
                other_fees: null,
                discount: Number(invoiceData.discount) || 0,
                total_amount: Number(invoiceData.totalAmount) || 0,
                room_code: invoiceData.roomCode || null,
                status: "UNPAID",
                due_date: invoiceData.dueDate || null,
                created_at: new Date().toISOString(),
                created_by: 1, // Assume 1 for now
                updated_at: new Date().toISOString(),
                updated_by: 1,
            };

            const { data, error } = await supabase
                .from(INVOICES)
                .insert([newInvoice])
                .select()
                .single();

            if (error) throw error;

            // Lưu meter_readings
            if (invoiceData.electricNew !== undefined && invoiceData.waterNew !== undefined) {
                const { data: existingMeter } = await supabase
                    .from(METER_READINGS)
                    .select("id")
                    .eq("room_id", invoiceData.roomId)
                    .eq("month", invoiceData.month)
                    .single();

                const meterPayload = {
                    electric_old: Number(invoiceData.electricOld) || 0,
                    electric_new: Number(invoiceData.electricNew) || 0,
                    electric_used: Number(invoiceData.electricUsage) || 0,
                    water_old: Number(invoiceData.waterOld) || 0,
                    water_new: Number(invoiceData.waterNew) || 0,
                    water_used: Number(invoiceData.waterUsage) || 0,
                };

                if (existingMeter) {
                    await supabase
                        .from(METER_READINGS)
                        .update({
                            ...meterPayload,
                            updated_at: new Date().toISOString(),
                            updated_by: 1
                        })
                        .eq("id", existingMeter.id);
                } else {
                    await supabase
                        .from(METER_READINGS)
                        .insert([{
                            ...meterPayload,
                            room_id: invoiceData.roomId,
                            contract_id: invoiceData.contractId,
                            month: invoiceData.month,
                            verified: true,
                            created_at: new Date().toISOString(),
                            created_by: 1,
                            updated_at: new Date().toISOString(),
                            updated_by: 1
                        }]);
                }
            }

            // Thêm tenant vào invoice_tenants
            const tenantIds = invoiceData.tenantIds || [];
            if (tenantIds.length > 0) {
                const junctionRows = tenantIds.map(tenantId => ({
                    invoice_id: data.id,
                    tenant_id: tenantId,
                }));
                const { error: junctionError } = await supabase
                    .from(INVOICE_TENANTS)
                    .insert(junctionRows);
                if (junctionError) {
                    console.error("Lỗi khi thêm tenant vào hóa đơn:", junctionError);
                }
            }

            return { success: true, data: toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi tạo hóa đơn:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Cập nhật hóa đơn chưa thanh toán
    // ─────────────────────────────────────────────────────────
    async updateInvoice(invoiceId, invoiceData) {
        try {
            const updatedInvoice = {
                room_fee: Number(invoiceData.roomFee) || 0,
                electric_price: Number(invoiceData.electricPrice) || 0,
                electric_usage: Number(invoiceData.electricUsage) || 0,
                electric_fee: Number(invoiceData.electricFee) || 0,
                water_price: Number(invoiceData.waterPrice) || 0,
                water_usage: Number(invoiceData.waterUsage) || 0,
                water_fee: Number(invoiceData.waterFee) || 0,
                internet_fee: Number(invoiceData.internetFee) || 0,
                service_fee: Number(invoiceData.serviceFee) || 0,
                discount: Number(invoiceData.discount) || 0,
                total_amount: Number(invoiceData.totalAmount) || 0,
                due_date: invoiceData.dueDate || null,
                updated_at: new Date().toISOString(),
                updated_by: 1,
            };

            const { data, error } = await supabase
                .from(INVOICES)
                .update(updatedInvoice)
                .eq("id", invoiceId)
                .select()
                .single();

            if (error) throw error;

            // Cập nhật meter_readings nếu có truyền chỉ số
            if (invoiceData.electricNew !== undefined && invoiceData.waterNew !== undefined) {
                // Kiểm tra xem đã có meter_reading cho tháng này chưa
                const { data: existingMeter } = await supabase
                    .from(METER_READINGS)
                    .select("id")
                    .eq("room_id", invoiceData.roomId)
                    .eq("month", invoiceData.month)
                    .single();

                const meterPayload = {
                    electric_old: Number(invoiceData.electricOld) || 0,
                    electric_new: Number(invoiceData.electricNew) || 0,
                    electric_used: Number(invoiceData.electricUsage) || 0,
                    water_old: Number(invoiceData.waterOld) || 0,
                    water_new: Number(invoiceData.waterNew) || 0,
                    water_used: Number(invoiceData.waterUsage) || 0,
                };

                if (existingMeter) {
                    await supabase
                        .from(METER_READINGS)
                        .update({
                            ...meterPayload,
                            updated_at: new Date().toISOString(),
                            updated_by: 1
                        })
                        .eq("id", existingMeter.id);
                } else {
                    await supabase
                        .from(METER_READINGS)
                        .insert([{
                            ...meterPayload,
                            room_id: invoiceData.roomId,
                            contract_id: invoiceData.contractId,
                            month: invoiceData.month,
                            verified: true,
                            created_at: new Date().toISOString(),
                            created_by: 1,
                            updated_at: new Date().toISOString(),
                            updated_by: 1
                        }]);
                }
            }

            return { success: true, data: toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi cập nhật hóa đơn:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Xóa hóa đơn (soft delete)
    // ─────────────────────────────────────────────────────────
    async deleteInvoice(invoiceId) {
        try {
            const { error } = await supabase
                .from(INVOICES)
                .update({ status: "CANCELLED", updated_at: new Date().toISOString(), updated_by: 1 })
                .eq("id", invoiceId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa hóa đơn:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Đánh dấu đã thanh toán:
    //   - Cập nhật invoice.status = PAID, paid_at
    //   - Tạo record trong payments
    // paymentData: { amount, paymentMethod, transactionCode, note }
    // ─────────────────────────────────────────────────────────
    async markAsPaid(invoiceId, roomId, paymentData) {
        try {
            const paidAt = new Date().toISOString();

            // 1. Cập nhật invoice
            const { error: invoiceError } = await supabase
                .from(INVOICES)
                .update({
                    status: "PAID",
                    paid_at: paidAt,
                    updated_at: paidAt,
                    updated_by: 1,
                })
                .eq("id", invoiceId);

            if (invoiceError) throw invoiceError;

            // 2. Tạo payment record
            const paymentRecord = {
                invoice_id: invoiceId,
                room_id: roomId || null,
                amount: Number(paymentData.amount) || 0,
                payment_method: paymentData.paymentMethod || null,
                transaction_code: paymentData.transactionCode || null,
                note: paymentData.note || null,
                paid_at: paidAt,
                created_at: paidAt,
                created_by: 1,
                updated_at: paidAt,
                updated_by: 1,
            };

            const { error: paymentError } = await supabase
                .from(PAYMENTS)
                .insert([paymentRecord]);

            if (paymentError) {
                console.error("Lỗi khi tạo payment record:", paymentError);
            }

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi đánh dấu thanh toán:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Lấy chỉ số đồng hồ gần nhất của phòng (để auto-fill chỉ số cũ)
    // ─────────────────────────────────────────────────────────
    async getLatestMeterReading(roomId, contractId) {
        try {
            let query = supabase
                .from(METER_READINGS)
                .select("*")
                .eq("room_id", roomId)
                .order("month", { ascending: false })
                .limit(1);

            if (contractId) {
                query = query.eq("contract_id", contractId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return { success: true, data: data.length > 0 ? toCamelCase(data[0]) : null };
        } catch (error) {
            console.error("Lỗi khi lấy chỉ số đồng hồ:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Lấy giá điện/nước/internet/dịch vụ hiện tại của property
    // ─────────────────────────────────────────────────────────
    async getUtilityPrices(propertyId) {
        try {
            let query = supabase
                .from(UTILITY_PRICES)
                .select("*")
                .is("effective_to", null) // bản ghi đang hiệu lực
                .order("effective_from", { ascending: false })
                .limit(1);

            if (propertyId) {
                query = query.eq("property_id", propertyId);
            }

            const { data, error } = await query;
            if (error) throw error;

            return { success: true, data: data.length > 0 ? toCamelCase(data[0]) : null };
        } catch (error) {
            console.error("Lỗi khi lấy giá dịch vụ:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Lấy danh sách hợp đồng ACTIVE kèm thông tin phòng + khách đại diện
    // (dùng để chọn phòng khi tạo hóa đơn)
    // ─────────────────────────────────────────────────────────
    async getActiveContractsWithDetails() {
        try {
            const { data, error } = await supabase
                .from(CONTRACTS)
                .select(`
                    id,
                    room_id,
                    property_id,
                    representative_tenant_id,
                    monthly_rent,
                    billing_day,
                    rooms (id, room_code, current_price, property_id),
                    tenants!contracts_representative_tenant_id_fkey (id, full_name)
                `)
                .eq("status", "ACTIVE")
                .order("created_at", { ascending: true });

            if (error) throw error;

            const contracts = data.map(row => ({
                id: row.id,
                roomId: row.room_id,
                propertyId: row.property_id || row.rooms?.property_id,
                representativeTenantId: row.representative_tenant_id,
                monthlyRent: row.monthly_rent,
                billingDay: row.billing_day,
                roomCode: row.rooms?.room_code || String(row.room_id),
                currentPrice: row.rooms?.current_price || row.monthly_rent,
                tenantName: row.tenants?.full_name || '',
            }));

            return { success: true, data: contracts };
        } catch (error) {
            console.error("Lỗi khi lấy hợp đồng đang hoạt động:", error);
            return { success: false, error: error.message };
        }
    },

    // ─────────────────────────────────────────────────────────
    // Lấy danh sách phòng để dùng trong filter
    // ─────────────────────────────────────────────────────────
    async getRoomsForFilter() {
        try {
            const { data, error } = await supabase
                .from("rooms")
                .select("id, room_code")
                .order("room_code", { ascending: true });

            if (error) throw error;

            return {
                success: true,
                data: data.map(r => ({ id: r.id, roomCode: r.room_code })),
            };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách phòng:", error);
            return { success: false, error: error.message };
        }
    },
};
