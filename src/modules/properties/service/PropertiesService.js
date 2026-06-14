import { supabase } from '../../../supabase/config';
import { toCamelCase } from '../../../supabase/caseUtils';

// Tên bảng trên Supabase
const TABLE_NAME = "properties";

export const PropertiesService = {

    // Lấy danh sách properties
    async getProperties() {
        try {
            const { data, error } = await supabase
                .from(TABLE_NAME)
                .select("id, name")
                .eq("status", "ACTIVE");

            if (error) throw error;

            const properties = data.map(toCamelCase);
            return { success: true, data: properties };

        } catch (error) {
            console.error("Lỗi khi lấy danh sách khu trọ: ", error);
            return { success: false, error: error.message };
        }
    },
}
