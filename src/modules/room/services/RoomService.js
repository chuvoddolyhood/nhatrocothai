import { supabase } from "../../../supabase/config";
import { toCamelCase } from "../../../supabase/caseUtils";
import { RoomStatus } from "../constants/RoomStatus";
import { notificationRef } from "../../../shared/contexts/NotificationContext";

// Tên bảng trên Supabase
const TABLE_NAME = "rooms";

export const RoomService = {
    // Lấy danh sách phòng
    async getRooms() {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("*")
                .neq("status", RoomStatus.ARCHIVED);

            if (error) throw error;

            const rooms = data.map(row => ({
                ...toCamelCase(row),
                // Map room_code → roomId để UI không cần thay đổi
                roomId: row.room_code,
            }));

            return { success: true, data: rooms };

        } catch (error) {
            notificationRef.current?.showError(error);
            return { success: false, error: error.message };
        }
    },

    // Đăng ký (Thêm mới) phòng
    async addRoom(roomData) {
        try {
            const newRoom = {
                property_id: roomData.propertyId || null,
                room_code: roomData.roomId || '',
                status: roomData.status || 'AVAILABLE',
                current_contract_id: roomData.currentContractId || null,
                current_price: roomData.currentPrice || 0,
                floor: roomData.floor || '',
                area: roomData.area || 0,
                created_at: new Date().toISOString(),
                created_by: roomData.createdBy || null,
                updated_at: new Date().toISOString(),
                updated_by: roomData.updatedBy || null
            };

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .insert([newRoom])
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                ...toCamelCase(data),
                roomId: data.room_code,
            };

        } catch (error) {
            notificationRef.current?.showError(error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật phòng
    async updateRoom(roomId, roomData) {
        try {
            const updatedRoom = {
                property_id: roomData.propertyId || null,
                room_code: roomData.roomId || '',
                status: roomData.status || RoomStatus.AVAILABLE,
                current_contract_id: roomData.currentContractId || null,
                current_price: roomData.currentPrice || 0,
                floor: roomData.floor || '',
                area: roomData.area || 0,
                updated_at: new Date().toISOString(),
                updated_by: roomData.updatedBy || null,
            };

            const { data, error } = await supabase
                .from(TABLE_NAME)
                .update(updatedRoom)
                .eq("id", roomId)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                ...toCamelCase(data),
                roomId: data.room_code,
            };

        } catch (error) {
            notificationRef.current?.showError(error);
            return { success: false, error: error.message };
        }
    },

    // Cập nhật phòng sang ARCHIVED
    async softDeleteRoom(roomId) {
        try {
            const { error } = await supabase
                .from(TABLE_NAME)
                .update({
                    status: RoomStatus.ARCHIVED,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", roomId);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            notificationRef.current?.showError(error);
            return { success: false, error: error.message };
        }
    }

};
