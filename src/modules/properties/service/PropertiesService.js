import { supabase } from '../../../supabase/config';
import { toCamelCase } from '../../../supabase/caseUtils';
import { PROPERTIES } from '../../../supabase/DatabaseModel';

export const PropertiesService = {
    // Lấy danh sách properties
    async getProperties(filters = {}) {
        try {
            let query = supabase
                .from(PROPERTIES)
                .select("*")
                .order("created_at", { ascending: false });

            if (filters.status) {
                query = query.eq("status", filters.status);
            } else {
                // Mặc định chỉ lấy properties ACTIVE
                query = query.eq("status", "ACTIVE");
            }

            const { data, error } = await query;

            if (error) throw error;

            const properties = data.map(toCamelCase);
            return { success: true, data: properties };
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khu trọ:", error);
            return { success: false, error: error.message };
        }
    },

    // Lấy chi tiết một property
    async getPropertyById(propertyId) {
        try {
            const { data, error } = await supabase
                .from(PROPERTIES)
                .select("*")
                .eq("id", propertyId)
                .single();

            if (error) throw error;

            if (data) {
                return { success: true, data: toCamelCase(data) };
            } else {
                return { success: false, error: "Không tìm thấy khu trọ" };
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin khu trọ:", error);
            return { success: false, error: error.message };
        }
    },

    // Thêm property mới
    async addProperty(propertyData) {
        try {
            const newProperty = {
                owner_id: propertyData.ownerId || 1,
                name: propertyData.name || '',
                address: propertyData.address || '',
                room_count: propertyData.roomCount || 0,
                occupied_room_count: propertyData.occupiedRoomCount || 0,
                status: propertyData.status || 'ACTIVE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from(PROPERTIES) 
                .insert([newProperty])
                .select()
                .single();

            if (error) throw error;

            return { success: true, data: toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi thêm khu trọ mới:", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật property
    async updateProperty(propertyId, propertyData) {
        try {
            const updatedProperty = {
                name: propertyData.name,
                address: propertyData.address,
                status: propertyData.status,
                updated_at: new Date().toISOString(),
            };

            // Không cho phép cập nhật room_count và occupied_room_count trực tiếp
            // Chúng được tự động tính từ rooms table

            const { data, error } = await supabase
                .from(PROPERTIES)
                .update(updatedProperty)
                .eq("id", propertyId)
                .select()
                .single();

            if (error) throw error;

            return { success: true, data: toCamelCase(data) };
        } catch (error) {
            console.error("Lỗi khi cập nhật khu trọ:", error);
            return { success: false, error: error.message };
        }
    },

    // Xóa mềm property (chuyển status sang INACTIVE)
    async softDeleteProperty(propertyId) {
        try {
            const { error } = await supabase
                .from(PROPERTIES)
                .update({
                    status: 'INACTIVE',
                    updated_at: new Date().toISOString(),
                })
                .eq("id", propertyId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi xóa khu trọ:", error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật số lượng phòng (được gọi tự động khi thêm/xóa room)
    async updateRoomCounts(propertyId) {
        try {
            // Đếm tổng số phòng
            const { count: totalCount, error: totalError } = await supabase
                .from('rooms')
                .select('*', { count: 'exact', head: true })
                .eq('property_id', propertyId)
                .neq('status', 'ARCHIVED');

            if (totalError) throw totalError;

            // Đếm số phòng đang thuê
            const { count: occupiedCount, error: occupiedError } = await supabase
                .from('rooms')
                .select('*', { count: 'exact', head: true })
                .eq('property_id', propertyId)
                .eq('status', 'OCCUPIED');

            if (occupiedError) throw occupiedError;

            // Cập nhật vào properties
            const { error: updateError } = await supabase
                .from(PROPERTIES)
                .update({
                    room_count: totalCount || 0,
                    occupied_room_count: occupiedCount || 0,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', propertyId);

            if (updateError) throw updateError;

            return { success: true };
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng phòng:", error);
            return { success: false, error: error.message };
        }
    },
};
