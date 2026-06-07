import { supabase } from "../../../supabase/config";
import { toCamelCase } from "../../../supabase/caseUtils";
import { TenantStatus } from "../constants/TenantStatus";

// Tên bảng trên Supabase
const TABLE_NAME = "tenants";

export const TenantService = {
    // Lấy danh sách khách thuê
    async getTenants() {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*")
                .neq("status", TenantStatus.MOVED_OUT)
                .order("created_at", { ascending: true });

            if (error) throw error;

            const tenants = data.map(toCamelCase);
            return { success: true, data: tenants };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khách thuê: ", error);
            return { success: false, error: error.message };
        }
    },

    // Lấy thông tin chi tiết một khách thuê
    async getTenantById(tenantId) {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*")
                .eq("id", tenantId)
                .single();

            if (error) throw error;

            if (data) {
                return { success: true, data: toCamelCase(data) };
            } else {
                return { success: false, error: "Không tìm thấy khách thuê" };
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin khách thuê: ", error);
            return { success: false, error: error.message };
        }
    },

    // Đăng ký (Thêm mới) khách thuê
    async addTenant(tenantData) {
        try {
            const newTenant = {
                full_name: tenantData.fullName || '',
                phone: tenantData.phone || '',
                citizen_id: tenantData.citizenId || '',
                birth_date: tenantData.birthDate || '',
                permanent_address: tenantData.permanentAddress || '',
                citizen_id_front_url: tenantData.citizenIdFrontUrl || '',
                citizen_id_back_url: tenantData.citizenIdBackUrl || '',
                status: tenantData.status || 'ACTIVE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: tenantData.createdBy || null,
                updated_by: tenantData.updatedBy || null
            };

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([newTenant])
                .select()
                .single();

            if (error) throw error;

            return { success: true, ...toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi thêm khách thuê mới: ", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật thông tin khách thuê
    async updateTenant(tenantId, tenantData) {
        try {
            const updatedTenant = {
                full_name: tenantData.fullName !== undefined ? tenantData.fullName : '',
                phone: tenantData.phone !== undefined ? tenantData.phone : '',
                citizen_id: tenantData.citizenId !== undefined ? tenantData.citizenId : '',
                birth_date: tenantData.birthDate !== undefined ? tenantData.birthDate : '',
                permanent_address: tenantData.permanentAddress !== undefined ? tenantData.permanentAddress : '',
                citizen_id_front_url: tenantData.citizenIdFrontUrl !== undefined ? tenantData.citizenIdFrontUrl : '',
                citizen_id_back_url: tenantData.citizenIdBackUrl !== undefined ? tenantData.citizenIdBackUrl : '',
                status: tenantData.status !== undefined ? tenantData.status : TenantStatus.ACTIVE,
                updated_at: new Date().toISOString(),
                updated_by: tenantData.updatedBy || null
            };

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update(updatedTenant)
                .eq("id", tenantId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, ...toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi cập nhật khách thuê: ", error);
            return { success: false, error: error.message };
        }
    },

    // Xóa mềm khách thuê (Chuyển status sang MOVED_OUT)
    async softDeleteTenant(tenantId) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .update({
                    status: TenantStatus.MOVED_OUT,
                    updated_at: new Date().toISOString()
                })
                .eq("id", tenantId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa khách thuê: ", error);
            return { success: false, error: error.message };
        }
    }
};