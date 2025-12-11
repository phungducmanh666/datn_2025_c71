package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class AttributeSQL {
    // #region crud
    public static String CREATE_NAME_ONLY_SQL(UUID groupUUID, String name, Map<String, Object> params) {
        params.put("name", name);
        params.put("reference_uuid", groupUUID);
        return String.format("""
                INSERT INTO %s(name, reference_uuid)
                OUTPUT inserted.uuid, inserted.name
                VALUES(:name, :reference_uuid)
                """, DBTableName.ATTRIBUTE);
    }

    public static String SELECT_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                SELECT *
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.ATTRIBUTE);
    }

    public static String SELECT_BY_FILTER(UUID groupUUID, Integer page, Integer size, String sort, String search,
            Map<String, Object> params) {
        StringBuilder sql = new StringBuilder("SELECT * FROM ").append(DBTableName.ATTRIBUTE);

        if (groupUUID != null) {
            sql.append(" WHERE ").append("reference_uuid").append(" = :reference_uuid");
            params.put("reference_uuid", groupUUID);

        }

        // #region search
        if (search != null && !search.isEmpty()) {
            sql.append(" AND ").append("name").append(" LIKE :search");
            params.put("search", "%" + search + "%");
        }
        // #endregion

        // #region sort
        String sortField = "uuid";
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

        // #region page
        if (page != null && size != null) {
            int safePage = page >= 0 ? page : 0;
            int safeSize = size >= 0 ? size : 10;
            int offset = safePage * safeSize;
            sql.append(" OFFSET ").append(offset)
                    .append(" ROWS FETCH NEXT ").append(size).append(" ROWS ONLY");
        }
        // #endregion

        return sql.toString();
    }

    public static String COUNT_BY_FILTER(UUID groupUUID, String search, Map<String, Object> params) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) AS cnt FROM ").append(DBTableName.ATTRIBUTE);

        if (groupUUID != null) {
            sql.append(" WHERE ").append("reference_uuid").append(" = :reference_uuid");
            params.put("reference_uuid", groupUUID);
        }

        if (search != null && !search.isEmpty()) {
            sql.append(" AND ").append("name").append(" LIKE :search");
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
                """, DBTableName.ATTRIBUTE);
    }

    public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                DELETE
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.ATTRIBUTE);
    }
    // #endregion

    // #region checking
    public static String CHECK_NAME_EXISTS(UUID groupUUID, String name, Map<String, Object> params) {
        params.put("name", name);
        params.put("reference_uuid", groupUUID);
        return String.format("""
                SELECT CASE WHEN EXISTS(
                    SELECT 1
                    FROM %s
                    WHERE name = :name
                    AND reference_uuid = :reference_uuid
                ) THEN 1 ELSE 0 END AS exists_flag
                """, DBTableName.ATTRIBUTE);
    }
    // #endregion

}
