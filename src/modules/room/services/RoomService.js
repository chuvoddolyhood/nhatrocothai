import { supabase } from "../../../supabase/config";
import { toCamelCase } from "../../../supabase/caseUtils";
import { RoomStatus } from "../constants/RoomStatus";
import { notificationRef } from "../../../shared/contexts/NotificationContext";
import { RoomPriceService } from "./RoomPriceService";
import { ROOMS } from "../../../supabase/DatabaseModel";

export const RoomService = {
    // Lấy danh sách phòng
    async getRooms(status) {
        try {
            let query = supabase
                .from(ROOMS)
                .select("*")
                .neq("status", RoomStatus.ARCHIVED)
                .order("created_at", { ascending: true });

            if (status && status !== 'ALL') {
                query = query.eq("status", status);
            }

            const { data, error } = await query;

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
                .from(ROOMS)
                .insert([newRoom])
                .select()
                .single();

            if (error) throw error;

            // Insert initial price into room_prices history
            if (data.current_price) {
                await RoomPriceService.addPriceHistory(data.id, data.current_price);
            }

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
            // Lấy giá hiện tại trước khi cập nhật
            const { data: oldRoom, error: fetchError } = await supabase
                .from(ROOMS)
                .select("current_price")
                .eq("id", roomId)
                .single();

            if (fetchError) throw fetchError;

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
                .from(ROOMS)
                .update(updatedRoom)
                .eq("id", roomId)
                .select()
                .single();

            if (error) throw error;

            // Nếu giá thay đổi → đóng bản ghi giá cũ và tạo bản ghi giá mới
            const oldPrice = oldRoom.current_price;
            const newPrice = data.current_price;

            if (newPrice !== oldPrice) {
                await RoomPriceService.closePriceHistory(roomId);
                await RoomPriceService.addPriceHistory(roomId, newPrice);
            }

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
                .from(ROOMS)
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
