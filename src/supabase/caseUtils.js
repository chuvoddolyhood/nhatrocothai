/**
 * Chuyển đổi object từ snake_case (Supabase/PostgreSQL) sang camelCase (JS)
 */
export function toCamelCase(obj) {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    if (typeof obj !== 'object') return obj;

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
            value
        ])
    );
}

/**
 * Chuyển đổi object từ camelCase (JS) sang snake_case (Supabase/PostgreSQL)
 */
export function toSnakeCase(obj) {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    if (typeof obj !== 'object') return obj;

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`),
            value
        ])
    );
}
