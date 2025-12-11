package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class AttributeGroupSQL {
    // #region crud
    public static String CREATE_NAME_ONLY_SQL(String name, Map<String, Object> params) {
        params.put("name", name);
        return String.format("""
                INSERT INTO %s(name)
                OUTPUT inserted.uuid, inserted.name
                VALUES(:name)
                """, DBTableName.ATTRIBUTE_GROUP);
    }

    public static String SELECT_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                SELECT *
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.ATTRIBUTE_GROUP);
    }

    public static String SELECT_BY_FILTER(Integer page, Integer size, String sort, String search,
            Map<String, Object> params) {
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT ag.uuid, ag.name, ");
        sql.append("(")
                .append("SELECT a.uuid, a.name ")
                .append("FROM attributes a ")
                .append("WHERE a.reference_uuid = ag.uuid ")
                .append("FOR JSON PATH")
                .append(") AS attributes_json ")
                .append("FROM ").append(DBTableName.ATTRIBUTE_GROUP).append(" ag ");

        // #region search
        if (search != null && !search.isEmpty()) {
            sql.append("WHERE ag.name LIKE :search ");
            params.put("search", "%" + search + "%");
        }
        // #endregion

        // #region sort
        String sortField = "uuid";
        String sortDirection = "ASC";
        if (sort != null && !sort.isEmpty()) {
            String[] parts = sort.split(",");
            sortField = "ag." + parts[0];
            if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1])) {
                sortDirection = "DESC";
            }
        }
        sql.append("ORDER BY ").append(sortField).append(" ").append(sortDirection).append(" ");
        // #endregion

        // #region page
        if (page != null && size != null) {
            int safePage = page >= 0 ? page : 0;
            int safeSize = size >= 0 ? size : 10;
            int offset = safePage * safeSize;
            sql.append("OFFSET ").append(offset)
                    .append(" ROWS FETCH NEXT ").append(safeSize).append(" ROWS ONLY");
        }
        // #endregion

        return sql.toString();
    }

    public static String COUNT_BY_FILTER(String search, Map<String, Object> params) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) AS cnt FROM ").append(DBTableName.ATTRIBUTE_GROUP);

        if (search != null && !search.isEmpty()) {
            sql.append(" WHERE ").append("name").append(" LIKE :search");
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
                """, DBTableName.ATTRIBUTE_GROUP);
    }

    public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                DELETE
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.ATTRIBUTE_GROUP);
    }
    // #endregion

    // #region checking
    public static String CHECK_NAME_EXISTS(String name, Map<String, Object> params) {
        params.put("name", name);
        return String.format("""
                SELECT CASE WHEN EXISTS(
                    SELECT 1
                    FROM %s
                    WHERE name = :name
                ) THEN 1 ELSE 0 END AS exists_flag
                """, DBTableName.ATTRIBUTE_GROUP);
    }
    // #endregion

}
