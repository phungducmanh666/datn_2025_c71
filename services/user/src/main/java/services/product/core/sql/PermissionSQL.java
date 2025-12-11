package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.Parameter;

import services.product.core.constance.DBTableName;

public class PermissionSQL {

  public static String CREATE_PERMISSION(String name, String description, Map<String, Object> params) {
    params.put("name", name);
    params.put("description", Parameter.fromOrEmpty(description, String.class));
    return String.format("""
        INSERT
        INTO %s (name, description)
        OUTPUT  inserted.uuid,  inserted.name, inserted.description
        VALUES (:name, :description)
        """, DBTableName.PERMISSION);

  }

  public static String SELECT_BY_NAME(String name, Map<String, Object> params) {
    params.put("name", name);
    return String.format("""
        SELECT *
        FROM %s
        WHERE name = :name
        """, DBTableName.PERMISSION);
  }

  public static String SELECT_ALL_PERMISSIONS(String sort, Map<String, Object> params) {
    StringBuilder sql = new StringBuilder(String.format("""
        SELECT *
        FROM %s
        """, DBTableName.PERMISSION));

    String sortField = "name";
    String sortDir = "ASC";

    if (sort != null && !sort.isEmpty()) {
      String[] sArr = sort.split(",");
      if (sArr.length == 2) {
        if (sArr[0] == "id" || sArr[0] == "name" || sArr[0] == "description") {
          sortField = sArr[0];
        }
        if (sArr[1] == "ASC" || sArr[1] == "DESC") {
          sortDir = sArr[1];
        }
      }
    }

    sql.append(String.format("ORDER BY %s %s", sortField, sortDir));

    return sql.toString();
  }

  public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
    params.put("uuid", uuid);
    return String.format("""
        DELETE
        FROM %s
        WHERE uuid = :uuid
        """, DBTableName.PERMISSION);
  }

  public static String CHECK_NAME_EXISTS(String name, Map<String, Object> params) {
    params.put("name", name);
    return String.format("""
        SELECT CASE WHEN EXISTS(
            SELECT 1
            FROM %s
            WHERE name = :name
        ) THEN 1 ELSE 0 END AS exists_flag
        """, DBTableName.PERMISSION);
  }

  // #region statistics
  public static String COUNT_ALL_PERMISSION() {
    return String.format("""
        SELECT COUNT(*) AS cnt
        FROM %s
        """, DBTableName.PERMISSION);
  }
  // #endregion

}
