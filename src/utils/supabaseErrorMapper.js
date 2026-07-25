import { COMMON_MESSAGE } from "../constants/messages";

/**
 * Tiện ích dịch và ánh xạ mã lỗi từ Supabase / PostgreSQL sang Tiếng Việt thân thiện.
 */
export const mapSupabaseError = (error) => {
    if (!error) return COMMON_MESSAGE.errors.UNKNOWN_ERROR;

    // Nếu error là một chuỗi, kiểm tra nội dung chuỗi
    if (typeof error === 'string') {
        return translateErrorMessage(error);
    }

    const message = error.message || "";
    const code = error.code || "";

    // 1. Ánh xạ dựa trên tên Constraint cụ thể trong thông báo lỗi
    if (message.includes("unique_property_room")) {
        return COMMON_MESSAGE.errors.ROOM_CODE_DUPLICATE;
    }
    if (message.includes("rooms_room_code_key")) {
        return COMMON_MESSAGE.errors.ROOM_CODE_SYSTEM_DUPLICATE;
    }
    if (message.includes("users_email_key")) {
        return COMMON_MESSAGE.errors.EMAIL_DUPLICATE;
    }
    if (message.includes("tenants_citizen_id_key")) {
        return COMMON_MESSAGE.errors.CITIZEN_ID_DUPLICATE;
    }
    if (message.includes("contracts_room_id_status_key")) {
        return COMMON_MESSAGE.errors.CONTRACT_ACTIVE_EXISTS;
    }

    // 2. Ánh xạ dựa trên mã lỗi PostgreSQL (SQLSTATE)
    const codeMap = {
        "23505": COMMON_MESSAGE.errors.DUPLICATE_DATA, // Unique violation
        "23503": COMMON_MESSAGE.errors.FOREIGN_KEY_VIOLATION, // Foreign key violation
        "23502": COMMON_MESSAGE.errors.NOT_NULL_VIOLATION, // Not null violation
        "22001": COMMON_MESSAGE.errors.DATA_TOO_LONG, // Value too long / truncation
        "22P02": COMMON_MESSAGE.errors.INVALID_DATA_TYPE, // Invalid text representation
        "42P01": COMMON_MESSAGE.errors.DB_TABLE_NOT_FOUND, // Undefined table
    };

    if (codeMap[code]) {
        return codeMap[code];
    }

    // Dịch các lỗi thông thường nếu có
    return translateErrorMessage(message) || COMMON_MESSAGE.errors.DB_CONNECTION_ERROR;
};

/**
 * Hỗ trợ dịch nhanh các chuỗi thông báo lỗi tiếng Anh phổ biến
 */
const translateErrorMessage = (msg) => {
    if (!msg) return "";

    const lower = msg.toLowerCase();
    if (lower.includes("duplicate key value violates unique constraint")) {
        if (lower.includes("rooms_room_code_key")) {
            return COMMON_MESSAGE.errors.ROOM_CODE_SYSTEM_DUPLICATE;
        }
        return COMMON_MESSAGE.errors.DUPLICATE_DATA;
    }
    if (lower.includes("violates foreign key constraint")) {
        return COMMON_MESSAGE.errors.INVALID_DATA_FORMAT;
    }

    return msg;
};
