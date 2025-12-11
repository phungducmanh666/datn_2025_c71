package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class CatalogBrandSQL {
  public static String SELECT_BY_CATALOG_AND_FILTER(
      UUID catalogUUID,
      Integer page,
      Integer size,
      String sort,
      String search,
      Map<String, Object> params) {

    StringBuilder sql = new StringBuilder("""
            SELECT b.*
            FROM %s b
            JOIN %s cb ON cb.brand_uuid = b.uuid
            WHERE cb.catalog_uuid = :catalog_uuid
        """.formatted(DBTableName.BRAND, DBTableName.CATALOG_BRAND));

    params.put("catalog_uuid", catalogUUID);

    // #region search
    if (search != null && !search.isEmpty()) {
      sql.append(" AND b.name LIKE :search");
      params.put("search", "%" + search + "%");
    }
    // #endregion

    // #region sort
    String sortField = "b.uuid";
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

  public static String COUNT_BY_CATALOG_AND_FILTER(UUID catalogUUID, String search, Map<String, Object> params) {
    StringBuilder sql = new StringBuilder("""
            SELECT COUNT(*) AS cnt
            FROM %s b
            JOIN %s cb ON cb.brand_uuid = b.uuid
            WHERE cb.catalog_uuid = :catalog_uuid
        """.formatted(DBTableName.BRAND, DBTableName.CATALOG_BRAND));

    params.put("catalog_uuid", catalogUUID);

    if (search != null && !search.isEmpty()) {
      sql.append(" AND b.name LIKE :search");
      params.put("search", "%" + search + "%");
    }

    return sql.toString();
  }

  public static String CREATE_CATALOG_BRAND_CONNECTION(UUID catalogUUID, UUID brandUUID, Map<String, Object> params) {
    params.put("catalog_uuid", catalogUUID);
    params.put("brand_uuid", brandUUID);
    return String.format("""
        INSERT INTO %s(catalog_uuid, brand_uuid)
        VALUES(:catalog_uuid, :brand_uuid)
        """, DBTableName.CATALOG_BRAND);
  }

  public static String SELECT_CATALOG_BRAND(UUID catalogUUID, UUID brandUUID, Map<String, Object> params) {
    params.put("catalog_uuid", catalogUUID);
    params.put("brand_uuid", brandUUID);
    return String.format("""
        SELECT uuid
        FROM %s
        WHERE catalog_uuid = :catalog_uuid
        AND brand_uuid = :brand_uuid
        """, DBTableName.CATALOG_BRAND);
  }

  public static String REMOVE_CATALOG_BRAND_CONNECTION(UUID catalogUUID, UUID brandUUID, Map<String, Object> params) {
    params.put("catalog_uuid", catalogUUID);
    params.put("brand_uuid", brandUUID);
    return String.format("""
        DELETE
        FROM %s
        WHERE catalog_uuid = :catalog_uuid
        AND brand_uuid = :brand_uuid
        """, DBTableName.CATALOG_BRAND);
  }

  public static String CHECK_PAIR_EXISTS(UUID catalogUUID, UUID brandUUID, Map<String, Object> params) {
    params.put("catalog_uuid", catalogUUID);
    params.put("brand_uuid", brandUUID);
    return String.format("""
        SELECT CASE WHEN EXISTS(
            SELECT 1
            FROM %s
            WHERE catalog_uuid = :catalog_uuid
            AND brand_uuid = :brand_uuid
        ) THEN 1 ELSE 0 END AS exists_flag
        """, DBTableName.CATALOG_BRAND);
  }

}
