package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.Parameter;

import services.product.core.constance.DBTableName;

public class RoleSQL {
  // #region role
  public static String CREATE_ROLE(String name, String description, Map<String, Object> params) {
    params.put("name", name);
    params.put("description", Parameter.fromOrEmpty(description, String.class));
    return String.format("""
        INSERT
        INTO %s (name, description)
        OUTPUT inserted.uuid, inserted.name, inserted.description
        VALUES (:name, :description)
        """, DBTableName.ROLE);
  }

  public static String SELECT_BY_UUID(UUID roleUUID, Map<String, Object> params) {
    params.put("uuid", roleUUID);
    return String.format("""
        SELECT *
        FROM %s
        WHERE uuid = :uuid
        """, DBTableName.ROLE);
  }

  public static String SELECT_BY_NAME(String name, Map<String, Object> params) {
    params.put("name", name);
    return String.format("""
        SELECT *
        FROM %s
        WHERE name = :name
        """, DBTableName.ROLE);
  }

  public static String UPDATE_ROLE_NAME(UUID uuid, String name, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("name", name);
    return String.format("""
        UPDATE %s
        SET name = :name
        WHERE uuid = :uuid
        """, DBTableName.ROLE);
  }

  public static String UPDATE_ROLE_DESCRIPTION(UUID uuid, String description, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("description", description);
    return String.format("""
        UPDATE %s
        SET description = :description
        WHERE uuid = :uuid
        """, DBTableName.ROLE);
  }

  public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
    params.put("uuid", uuid);
    return String.format("""
        DELETE
        FROM %s
        WHERE uuid = :uuid
        """, DBTableName.ROLE);
  }

  public static String CHECK_NAME_EXISTS(String name, Map<String, Object> params) {
    params.put("name", name);
    return String.format("""
        SELECT CASE WHEN EXISTS(
            SELECT 1
            FROM %s
            WHERE name = :name
        ) THEN 1 ELSE 0 END AS exists_flag
        """, DBTableName.ROLE);
  }

  public static String SELECT_BY_FILTER(Integer page, Integer size, String sort, String search,
      Map<String, Object> params) {
    StringBuilder sql = new StringBuilder("SELECT * FROM ").append(DBTableName.ROLE);

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
    StringBuilder sql = new StringBuilder("SELECT COUNT(*) AS cnt FROM ").append(DBTableName.ROLE);

    if (search != null && !search.isEmpty()) {
      sql.append(" WHERE ").append("name").append(" LIKE :search");
      params.put("search", "%" + search + "%");
    }

    return sql.toString();
  }
  // #endregion

  // #region permissions
  public static String ASSIGN_PERMISSION(UUID roleUUID, UUID permissionUUID, Map<String, Object> params) {
    params.put("role_uuid", roleUUID);
    params.put("permission_uuid", permissionUUID);
    return String.format("""
        INSERT
        INTO %s (role_uuid, permission_uuid)
        VALUES (:role_uuid, :permission_uuid)
        """, DBTableName.ROLE_PERMISSION);
  }

  public static String REMOVE_PERMISSION(UUID roleUUID, UUID permissionUUID, Map<String, Object> params) {
    params.put("role_uuid", roleUUID);
    params.put("permission_uuid", permissionUUID);
    return String.format("""
        DELETE
        FROM %s
        WHERE role_uuid = :role_uuid AND permission_uuid = :permission_uuid
        """, DBTableName.ROLE_PERMISSION);
  }

  public static String SELECT_ALL_PERMISSION(UUID roleUUID, Map<String, Object> params) {
    params.put("role_uuid", roleUUID);
    return String.format("""
        SELECT p.*
        FROM %s p
        JOIN %s rp
          ON p.uuid = rp.permission_uuid
        WHERE rp.role_uuid = :role_uuid
        """, DBTableName.PERMISSION, DBTableName.ROLE_PERMISSION);
  }

  public static String CHECK_PERMISSION_ASSIGNED(UUID roleUUID, UUID permissionUUID, Map<String, Object> params) {
    params.put("role_uuid", roleUUID);
    params.put("permission_uuid", permissionUUID);
    return String.format("""
        SELECT CASE WHEN EXISTS(
            SELECT 1
            FROM %s
            WHERE role_uuid = :role_uuid AND permission_uuid = :permission_uuid
        ) THEN 1 ELSE 0 END AS exists_flag
        """, DBTableName.ROLE_PERMISSION);
  }
  // #endregion

  // #region statistics
  public static String COUNT_ALL_ROLE() {
    return String.format("""
        SELECT COUNT(*) AS cnt
        FROM %s
        """, DBTableName.ROLE);
  }
  // #endregion

}
