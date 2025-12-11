package services.product.core.sql;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.Parameter;

import services.product.core.constance.DBTableName;
import services.product.core.eum.EAccountStatus;
import services.product.core.eum.EUserGender;
import services.product.helper.PasswordEncoder;

public class CustomerSQL {
  // #region staff
  public static String CREATE_CUSTOMER(
      String firstName,
      String lastName,
      LocalDateTime birthDate,
      EUserGender gender,
      String phoneNumber,
      String email,
      String photoUrl,
      Map<String, Object> params) {

    if (gender == null)
      gender = EUserGender.MALE;

    params.put("first_name", Parameter.fromOrEmpty(firstName, String.class));
    params.put("last_name", Parameter.fromOrEmpty(lastName, String.class));
    params.put("birth_date", Parameter.fromOrEmpty(birthDate, LocalDateTime.class));
    params.put("gender", gender.name());
    params.put("phone_number", Parameter.fromOrEmpty(phoneNumber, String.class));
    params.put("email", Parameter.fromOrEmpty(email, String.class));
    params.put("photo_url", Parameter.fromOrEmpty(photoUrl, String.class));
    return String.format(
        """
            INSERT
            INTO %s (first_name, last_name, gender, birth_date, phone_number, email, photo_url)
            OUTPUT inserted.uuid, inserted.first_name, inserted.last_name, inserted.birth_date, inserted.gender, inserted.phone_number, inserted.email, inserted.photo_url, inserted.address
            VALUES (:first_name, :last_name, :gender, :birth_date, :phone_number, :email, :photo_url)
            """,
        DBTableName.CUSTOMER);
  }

  public static String SELECT_CUSTOMER_BY_UUID(UUID uuid, Map<String, Object> params) {
    params.put("uuid", uuid);
    return String.format("""
        SELECT *
        FROM %s
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String SELECT_CUSTOMER_BY_EMAIL(String email, Map<String, Object> params) {
    params.put("email", email);
    return String.format("""
        SELECT *
        FROM %s
        WHERE email = :email
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_PHOTO_URL(UUID uuid, String photoUrl, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("photo_url", photoUrl);
    return String.format("""
        UPDATE %s
        SET photo_url = :photo_url
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_FIRST_NAME(UUID uuid, String firstName, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("first_name", firstName);
    return String.format("""
        UPDATE %s
        SET first_name = :first_name
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_LAST_NAME(UUID uuid, String lastName, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("last_name", lastName);
    return String.format("""
        UPDATE %s
        SET last_name = :last_name
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_GENDER(UUID uuid, EUserGender gender, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("gender", gender.name());
    return String.format("""
        UPDATE %s
        SET gender = :gender
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_BIRTH_DATE(UUID uuid, LocalDateTime birthDate, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("birth_date", birthDate);
    return String.format("""
        UPDATE %s
        SET birth_date = :birth_date
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_PHONE_NUMBER(UUID uuid, String phoneNumber, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("phone_number", phoneNumber);
    return String.format("""
        UPDATE %s
        SET phone_number = :phone_number
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_EMAIL(UUID uuid, String email, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("email", email);
    return String.format("""
        UPDATE %s
        SET email = :email
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String UPDATE_ADDRESS(UUID uuid, String address, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("address", address);
    return String.format("""
        UPDATE %s
        SET address = :address
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
    params.put("uuid", uuid);
    return String.format("""
        DELETE
        FROM %s
        WHERE uuid = :uuid
        """, DBTableName.CUSTOMER);
  }

  public static String CHECK_PHONE_NUMBER_EXISTS(String phoneNumber, Map<String, Object> params) {
    params.put("phone_number", phoneNumber);
    return String.format("""
        SELECT CASE WHEN EXISTS(
            SELECT 1
            FROM %s
            WHERE phone_number = :phone_number
        ) THEN 1 ELSE 0 END AS exists_flag
        """, DBTableName.CUSTOMER);
  }

  public static String CHECK_EMAIL_EXISTS(String email, Map<String, Object> params) {
    params.put("email", email);
    return String.format("""
        SELECT CASE WHEN EXISTS(
            SELECT 1
            FROM %s
            WHERE email = :email
        ) THEN 1 ELSE 0 END AS exists_flag
        """, DBTableName.CUSTOMER);
  }

  public static String SELECT_BY_FILTER(
      Integer page,
      Integer size,
      String sort,
      String search,
      Map<String, Object> params) {
    StringBuilder sql = new StringBuilder("SELECT * FROM ").append(DBTableName.CUSTOMER);

    // #region search
    if (search != null && !search.isEmpty()) {
      sql.append(
          " WHERE (first_name LIKE :search OR last_name LIKE :search OR email LIKE :search OR code like :search) ");
      params.put("search", "%" + search + "%");
    }
    // #endregion

    // #region sort
    Map<String, String> sortFields = Map.of(
        "uuid", "uuid",
        "firstName", "first_name",
        "lastName", "last_name",
        "birthDate", "birth_date",
        "gender", "gender",
        "email", "email",
        "phoneNumber", "phone_number");

    String sortField = "last_name";
    String sortDirection = "ASC";

    if (sort != null && !sort.isEmpty()) {
      String[] parts = sort.split(",");
      sortField = sortFields.get(parts[0]);
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
    StringBuilder sql = new StringBuilder("SELECT COUNT(*) AS cnt FROM ").append(DBTableName.CUSTOMER);

    if (search != null && !search.isEmpty()) {
      sql.append(
          " WHERE (first_name LIKE :search OR last_name LIKE :search OR email LIKE :search) ");
      params.put("search", "%" + search + "%");
    }

    return sql.toString();
  }

  // #endregion

  // #region account
  public static String CREATE_ACCOUNT(UUID customerUUID, String email, String password, Map<String, Object> params) {
    params.put("username", email);
    params.put("password", PasswordEncoder.encode(password));
    params.put("status", EAccountStatus.ACTIVE.name());
    params.put("customer_uuid", customerUUID);
    return String.format("""
        INSERT
        INTO %s (username, password, status, customer_uuid)
        OUTPUT inserted.username, inserted.password, inserted.status, inserted.staff_uuid, inserted.customer_uuid
        VALUES (:username, :password, :status, :customer_uuid )
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
                """, DBTableName.CUSTOMER);
  }
  // #endregion

  // #region statistics
  public static String COUNT_ALL_CUSTOMER() {
    return String.format("""
        SELECT COUNT(*) AS cnt
        FROM %s
        """, DBTableName.CUSTOMER);
  }

  // #endregion

}
