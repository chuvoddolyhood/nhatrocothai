import { supabase } from "../../../supabase/config";
import { ROOM_PRICES } from "../../../supabase/DatabaseModel";

export const RoomPriceService = {

    async addPriceHistory(roomId, price) {
        const { error } = await supabase
            .from(ROOM_PRICES)
            .insert([{
                room_id: roomId,
                price,
                effective_from: new Date().toISOString().split('T')[0],
                effective_to: null,
                created_by: 1
            }]);

        if (error) throw error;
    },

    // Đóng bản ghi giá hiện tại (set effective_to) cho phòng
    async closePriceHistory(roomId) {
        const today = new Date().toISOString().split('T')[0];

        const { error } = await supabase
            .from(ROOM_PRICES)
            .update({
                effective_to: today,
                updated_at: new Date().toISOString(),
                updated_by: 1
            })
            .eq("room_id", roomId)
            .is("effective_to", null);

        if (error) throw error;
    }
};