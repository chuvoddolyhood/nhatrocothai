import { supabase } from "../../../supabase/config";
import { toCamelCase } from "../../../supabase/caseUtils";
import { CONTRACT_TENANTS, CONTRACTS, ROOMS } from "../../../supabase/DatabaseModel";
import { ContractStatus } from "../constants/ContractStatus";

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
                created_by: 1,
            };

            const { data, error } = await supabase
                .from(CONTRACTS)
                .insert([newContract])
                .select()
                .single();

            if (error) throw error;

            // Thêm tenant vào bảng contract_tenants
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
                    .from(CONTRACT_TENANTS)
                    .insert(junctionRows);

                if (junctionError) {
                    console.error("Lỗi khi thêm tenant vào hợp đồng:", junctionError);
                }
            }

            // Cập nhật currentContractId và status cho phòng vào bảng Rooms
            if (contractData.roomId) {
                const isContractActive = !contractData.status || contractData.status === 'ACTIVE';
                const { error: roomUpdateError } = await supabase
                    .from(ROOMS)
                    .update({
                        status: isContractActive ? 'OCCUPIED' : 'AVAILABLE',
                        current_contract_id: isContractActive ? data.id : null,
                        updated_by: 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', contractData.roomId);

                if (roomUpdateError) {
                    console.error("Lỗi khi cập nhật trạng thái phòng:", roomUpdateError);
                }
            }

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
                .from(CONTRACTS)
                .select("*, contract_tenants(tenant_id)")
                .order("created_at", { ascending: false });

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
                .from(CONTRACTS)
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
                    updatedContract[snakeKey] = value === '' ? null : value;
                }
            });
            updatedContract.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from(CONTRACTS)
                .update(updatedContract)
                .eq("id", contractId)
                .select()
                .single();

            if (error) throw error;

            // Cập nhật contract_tenants nếu có thay đổi tenantIds hoặc representativeTenantId
            if (contractData.tenantIds !== undefined || contractData.representativeTenantId !== undefined) {
                // Xóa liên kết cũ
                await supabase
                    .from(CONTRACT_TENANTS)
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
                        .from(CONTRACT_TENANTS)
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
            // Lấy thông tin hợp đồng để biết room_id
            const { data: contractData, error: fetchError } = await supabase
                .from(CONTRACTS)
                .select("room_id")
                .eq("id", contractId)
                .single();

            if (fetchError) throw fetchError;

            const { error } = await supabase
                .from(CONTRACTS)
                .update({
                    status: status, // 'TERMINATED' hoặc 'EXPIRED'
                    updated_at: new Date().toISOString(),
                    updated_by: 1,
                })
                .eq("id", contractId);

            if (error) throw error;

            // Giải phóng phòng khi hợp đồng bị TERMINATED
            if (contractData?.room_id) {
                const { error: roomUpdateError } = await supabase
                    .from(ROOMS)
                    .update({
                        status: 'AVAILABLE',
                        current_contract_id: null,
                        updated_by: 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", contractData.room_id);

                if (roomUpdateError) {
                    console.error("Lỗi khi giải phóng phòng:", roomUpdateError);
                }
            }

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái hợp đồng: ", error);
            return { success: false, error: error.message };
        }
    }
};
