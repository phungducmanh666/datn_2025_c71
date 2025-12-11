package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class AccountSQL {
  // #region staff

  public static String SELECT_BY_USERNAME(String username, Map<String, Object> params) {
    params.put("username", username);
    return String.format("""
        SELECT *
        FROM %s
        WHERE username = :username
        """, DBTableName.ACCOUNT);
  }

  public static String SELECT_BY_STAFF_UUID(UUID staffUUID, Map<String, Object> params) {
    params.put("staff_uuid", staffUUID);
    return String.format("""
        SELECT *
        FROM %s
        WHERE staff_uuid = :staff_uuid
        """, DBTableName.ACCOUNT);
  }

  public static String UPDATE_PASSWORD(String username, String password, Map<String, Object> params) {
    params.put("username", username);
    params.put("password", password);
    return String.format("""
        UPDATE %s
        SET password = :password
        WHERE username = :username
        """, DBTableName.ACCOUNT);
  }
  // #endregion

  // #region permissions
  public static String ASSIGN_ROLE(String username, UUID roleUUID, Map<String, Object> params) {
    params.put("username", username);
    params.put("role_uuid", roleUUID);
    return String.format("""
        INSERT
        INTO %s (username, role_uuid)
        VALUES (:username, :role_uuid)
        """, DBTableName.ACCOUNT_ROLE);
  }

  public static String REMOVE_ROLE(String username, UUID roleUUID, Map<String, Object> params) {
    params.put("username", username);
    params.put("role_uuid", roleUUID);
    return String.format("""
        DELETE
        FROM %s
        WHERE username = :username AND role_uuid = :role_uuid
        """, DBTableName.ACCOUNT_ROLE);
  }

  public static String SELECT_ALL_ROLE(String username, Map<String, Object> params) {
    params.put("username", username);
    return String.format("""
        SELECT r.*
        FROM %s r
        JOIN %s ar
          ON r.uuid = ar.role_uuid
        WHERE ar.username = :username
        """, DBTableName.ROLE, DBTableName.ACCOUNT_ROLE);
  }
  // #endregion

  // #region code
  public static String GET_LAST_CODE() {
    return String.format("""
        SELECT ISNULL(MAX( CAST(SUBSTRING(code, 3, LEN(code) - 2) AS INT) ), 0)  AS MaxCodeNumber
        FROM %s
        WHERE code LIKE 'NV[0-9]%%' AND LEN(code) > 2
                """, DBTableName.STAFF);
  }
  // #endregion

}
