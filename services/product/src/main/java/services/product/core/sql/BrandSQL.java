package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.Parameter;

import services.product.core.constance.DBTableName;

public class BrandSQL {
    // #region crud
    public static String CREATE_NAME_ONLY_SQL(String name, Map<String, Object> params) {
        params.put("name", name);
        return String.format("""
                INSERT INTO %s(name)
                OUTPUT inserted.uuid, inserted.name, inserted.photo_url
                VALUES(:name)
                """, DBTableName.BRAND);
    }

    public static String SELECT_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                SELECT *
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.BRAND);
    }

    public static String SELECT_BY_FILTER(Integer page, Integer size, String sort, String search,
            Map<String, Object> params) {
        StringBuilder sql = new StringBuilder("SELECT * FROM ").append(DBTableName.BRAND);

        // #region search
        if (search != null && !search.isEmpty()) {
            sql.append(" WHERE ").append("name").append(" LIKE :search");
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

    public static String COUNT_BY_FILTER(String search, Map<String, Object> params) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) AS cnt FROM ").append(DBTableName.BRAND);

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
                """, DBTableName.BRAND);
    }

    public static String UPDATE_PHOTO_URL(UUID uuid, String photoUrl, Map<String, Object> params) {
        params.put("uuid", uuid);
        params.put("photo_url", Parameter.fromOrEmpty(photoUrl, UUID.class));
        return String.format("""
                UPDATE %s
                SET photo_url = :photo_url
                WHERE uuid = :uuid
                """, DBTableName.BRAND);
    }

    public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                DELETE
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.BRAND);
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
                """, DBTableName.BRAND);
    }
    // #endregion

}
