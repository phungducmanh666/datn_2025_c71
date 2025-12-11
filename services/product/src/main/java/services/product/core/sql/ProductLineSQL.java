package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class ProductLineSQL {

    // #region default product line
    public static String GET_DEFAULT(UUID catalogBrandUUID, Map<String, Object> params) {
        params.put("catalog_brand_uuid", catalogBrandUUID);
        return String.format("""
                SELECT *
                FROM %s
                WHERE reference_uuid = :catalog_brand_uuid
                  AND is_default = 1
                """, DBTableName.PRODUCT_LINE);
    }

    public static String CREATE_DEFAULT(UUID catalogBrandUUID, Map<String, Object> params) {
        params.put("catalog_brand_uuid", catalogBrandUUID);
        params.put("name", "Default");
        return String.format("""
                INSERT INTO %s(name, reference_uuid, is_default)
                OUTPUT inserted.*
                VALUES(:name, :catalog_brand_uuid, 1)
                """, DBTableName.PRODUCT_LINE);
    }
    // #endregion

    // #region crud
    public static String CREATE_NAME_ONLY_SQL(
            UUID referenceUUID,
            String name,
            Map<String, Object> params) {
        params.put("name", name);
        params.put("is_default", false);
        params.put("reference_uuid", referenceUUID);
        return String.format("""
                INSERT INTO %s(name, is_default,  reference_uuid)
                OUTPUT inserted.uuid, inserted.name, inserted.is_default
                VALUES(:name, :is_default, :reference_uuid)
                """, DBTableName.PRODUCT_LINE);
    }

    public static String SELECT_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                SELECT *
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.PRODUCT_LINE);
    }

    public static String SELECT_BY_FILTER(
            UUID catalogUUID,
            UUID brandUUID,
            Integer page, Integer size, String sort, String search,
            Map<String, Object> params) {

        StringBuilder sql = new StringBuilder("""
                    SELECT pl.*
                    FROM %s pl
                    JOIN %s cb ON cb.uuid = pl.reference_uuid
                    WHERE 1=1
                """.formatted(DBTableName.PRODUCT_LINE, DBTableName.CATALOG_BRAND));

        // #region filter catalog + brand
        if (catalogUUID != null) {
            sql.append(" AND cb.catalog_uuid = :catalog_uuid");
            params.put("catalog_uuid", catalogUUID);
        }

        if (brandUUID != null) {
            sql.append(" AND cb.brand_uuid = :brand_uuid");
            params.put("brand_uuid", brandUUID);
        }
        // #endregion

        // #region search
        if (search != null && !search.isEmpty()) {
            sql.append(" AND pl.name LIKE :search");
            params.put("search", "%" + search + "%");
        }
        // #endregion

        // #region sort
        String sortField = "pl.uuid";
        String sortDirection = "ASC";

        if (sort != null && !sort.isEmpty()) {
            String[] parts = sort.split(",");
            sortField = parts[0];
            if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1])) {
                sortDirection = "DESC";
            }
        }

        sql.append(" ORDER BY ").append(sortField).append(" ").append(sortDirection);
        // #endregion

        // #region pagination
        if (page != null && size != null) {
            int safePage = page >= 0 ? page : 0;
            int safeSize = size >= 0 ? size : 10;
            int offset = safePage * safeSize;
            sql.append(" OFFSET ").append(offset)
                    .append(" ROWS FETCH NEXT ").append(safeSize).append(" ROWS ONLY");
        }
        // #endregion

        return sql.toString();
    }

    public static String COUNT_BY_FILTER(
            UUID catalogUUID,
            UUID brandUUID,
            String search,
            Map<String, Object> params) {

        StringBuilder sql = new StringBuilder("""
                    SELECT COUNT(*) AS cnt
                    FROM %s pl
                    JOIN %s cb ON cb.uuid = pl.reference_uuid
                    WHERE 1=1
                """.formatted(DBTableName.PRODUCT_LINE, DBTableName.CATALOG_BRAND));

        // Lọc theo catalogUUID
        if (catalogUUID != null) {
            sql.append(" AND cb.catalog_uuid = :catalog_uuid");
            params.put("catalog_uuid", catalogUUID);
        }

        // Lọc theo brandUUID
        if (brandUUID != null) {
            sql.append(" AND cb.brand_uuid = :brand_uuid");
            params.put("brand_uuid", brandUUID);
        }

        // Lọc theo search
        if (search != null && !search.isEmpty()) {
            sql.append(" AND pl.name LIKE :search");
            params.put("search", "%" + search + "%");
        }

        return sql.toString();
    }

    public static String UPDATE_NAME(UUID uuid, String name, Map<String, Object> params) {
        params.put("uuid", uuid);
        params.put("name", name);
        return String.format("""
                UPDATE %s
                SET name = :name
                WHERE uuid = :uuid
                """, DBTableName.PRODUCT_LINE);
    }

    public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                DELETE
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.PRODUCT_LINE);
    }
    // #endregion

    // #region checking
    public static String CHECK_NAME_EXISTS(
            UUID catalogUUID,
            UUID brandUUID,
            String name,
            Map<String, Object> params) {

        params.put("name", name);

        StringBuilder sql = new StringBuilder("""
                SELECT CASE WHEN EXISTS (
                    SELECT 1
                    FROM %s pl
                    JOIN %s cb ON cb.uuid = pl.reference_uuid
                    WHERE pl.name = :name
                """.formatted(DBTableName.PRODUCT_LINE, DBTableName.CATALOG_BRAND));

        // Thêm điều kiện catalog_uuid
        if (catalogUUID != null) {
            sql.append(" AND cb.catalog_uuid = :catalog_uuid");
            params.put("catalog_uuid", catalogUUID);
        }

        // Thêm điều kiện brand_uuid
        if (brandUUID != null) {
            sql.append(" AND cb.brand_uuid = :brand_uuid");
            params.put("brand_uuid", brandUUID);
        }

        sql.append(") THEN 1 ELSE 0 END AS exists_flag");

        return sql.toString();
    }

    // #endregion

}
