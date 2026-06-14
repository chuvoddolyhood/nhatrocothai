import { supabase } from "../../../supabase/config";
import { toCamelCase } from "../../../supabase/caseUtils";

// Tên bảng trên Supabase
const TABLE_NAME = "contracts";
const JUNCTION_TABLE = "contract_tenants";

export const ContractService = {
    // Đăng ký (Thêm mới) hợp đồng
    async addContract(contractData) {
        try {
            const newContract = {
                property_id: contractData.propertyId || null,
                room_id: contractData.roomId || null,
                representative_tenant_id: contractData.representativeTenantId || null,
                deposit_amount: Number(contractData.depositAmount) || 0,
                monthly_rent: Number(contractData.monthlyRent) || 0,
                billing_day: Number(contractData.billingDay) || 1,
                start_date: contractData.startDate || new Date().toISOString().split('T')[0],
                end_date: contractData.endDate || null,
                status: contractData.status || 'ACTIVE',
                created_by: contractData.createdBy || null,
            };

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([newContract])
                .select()
                .single();

            if (error) throw error;

            // Thêm tenant vào bảng contract_tenants (junction table)
            const allTenantIds = [...new Set([
                ...(contractData.tenantIds || []),
                contractData.representativeTenantId
            ])].filter(Boolean);

            if (allTenantIds.length > 0) {
                const junctionRows = allTenantIds.map(tenantId => ({
                    contract_id: data.id,
                    tenant_id: tenantId,
                }));

                const { error: junctionError } = await supabase
                    .from(JUNCTION_TABLE)
                    .insert(junctionRows);

                if (junctionError) {
                    console.error("Lỗi khi thêm tenant vào hợp đồng:", junctionError);
                }
            }

            // TODO: Ở đây bạn có thể thêm logic gọi RoomService.updateRoom để cập nhật 
            // currentContractId cho phòng và đổi status phòng thành "OCCUPIED" (nếu cần).

            return { success: true, ...toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi tạo hợp đồng mới: ", error);
            return { success: false, error: error.message };
        }
    },

    // Lấy danh sách hợp đồng (có thể lọc theo propertyId, roomId, status)
    async getContracts(filters = {}) {
        try {
            let query = supabase
                .from(TABLE_NAME)
                .select("*, contract_tenants(tenant_id)");

            if (filters.status) {
                query = query.eq("status", filters.status);
            }
            if (filters.roomId) {
                query = query.eq("room_id", filters.roomId);
            }

            const { data, error } = await query;

            if (error) throw error;

            const contracts = data.map(row => {
                const mapped = toCamelCase(row);
                // Trích xuất tenantIds từ junction table, loại trừ representativeTenantId
                mapped.tenantIds = (row.contract_tenants || [])
                    .map(ct => ct.tenant_id)
                    .filter(id => id !== mapped.representativeTenantId);
                delete mapped.contractTenants;
                return mapped;
            });

            return { success: true, data: contracts };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Lấy chi tiết một hợp đồng
    async getContractById(contractId) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*, contract_tenants(tenant_id)")
                .eq("id", contractId)
                .single();

            if (error) throw error;

            if (data) {
                const mapped = toCamelCase(data);
                mapped.tenantIds = (data.contract_tenants || [])
                    .map(ct => ct.tenant_id)
                    .filter(id => id !== mapped.representativeTenantId);
                delete mapped.contractTenants;
                return { success: true, data: mapped };
            } else {
                return { success: false, error: "Không tìm thấy hợp đồng" };
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật hợp đồng
    async updateContract(contractId, contractData) {
        try {
            const fieldMap = {
                propertyId: 'property_id',
                roomId: 'room_id',
                representativeTenantId: 'representative_tenant_id',
                depositAmount: 'deposit_amount',
                monthlyRent: 'monthly_rent',
                billingDay: 'billing_day',
                startDate: 'start_date',
                endDate: 'end_date',
                status: 'status',
                createdBy: 'created_by',
            };

            // Chuyển đổi camelCase sang snake_case, loại bỏ undefined và tenantIds
            const updatedContract = {};
            Object.entries(contractData).forEach(([key, value]) => {
                if (value !== undefined && key !== 'tenantIds') {
                    const snakeKey = fieldMap[key] || key;
                    updatedContract[snakeKey] = value;
                }
            });
            updatedContract.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update(updatedContract)
                .eq("id", contractId)
                .select()
                .single();

            if (error) throw error;

            // Cập nhật contract_tenants nếu có thay đổi tenantIds hoặc representativeTenantId
            if (contractData.tenantIds !== undefined || contractData.representativeTenantId !== undefined) {
                // Xóa liên kết cũ
                await supabase
                    .from(JUNCTION_TABLE)
                    .delete()
                    .eq("contract_id", contractId);

                const finalRepId = data.representative_tenant_id;
                const finalTenantIds = contractData.tenantIds !== undefined ? contractData.tenantIds : [];

                const allTenantIds = [...new Set([
                    ...finalTenantIds,
                    finalRepId
                ])].filter(Boolean);

                if (allTenantIds.length > 0) {
                    const junctionRows = allTenantIds.map(tenantId => ({
                        contract_id: contractId,
                        tenant_id: tenantId,
                    }));

                    await supabase
                        .from(JUNCTION_TABLE)
                        .insert(junctionRows);
                }
            }

            return { success: true, ...toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi cập nhật hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    },

    // Thay đổi trạng thái hợp đồng (Chấm dứt / Hết hạn)
    async updateContractStatus(contractId, status) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .update({
                    status: status, // 'TERMINATED' hoặc 'EXPIRED'
                    updated_at: new Date().toISOString(),
                })
                .eq("id", contractId);

            if (error) throw error;

            // TODO: Ở đây bạn có thể thêm logic giải phóng phòng khi hợp đồng bị TERMINATED

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    }
};
