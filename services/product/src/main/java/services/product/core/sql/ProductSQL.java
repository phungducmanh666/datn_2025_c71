package services.product.core.sql;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.lang.Nullable;

import services.product.core.constance.DBTableName;
import services.product.core.eum.EProductStatus;

public class ProductSQL {

  // #region product

  public static String CREATE_PRODUCT(String name, String photoUrl, BigDecimal unitPrice, EProductStatus status,
      Map<String, Object> params) {
    params.put("name", name);
    params.put("photo_url", photoUrl);
    params.put("unit_price", unitPrice);
    params.put("status", status.name());
    return String.format("""
        INSERT INTO %s(name, photo_url, status, unit_price)
        OUTPUT inserted.uuid, inserted.name, inserted.photo_url, inserted.status, inserted.unit_price
        VALUES(:name, :photo_url, :status, :unit_price)
        """, DBTableName.PRODUCT);
  }

  public static String LINK_PRODUCT_LINE(UUID productUUID, UUID productLineUUID, Map<String, Object> params) {
    params.put("product_uuid", productUUID);
    params.put("product_line_uuid", productLineUUID);
    return String.format("""
        INSERT INTO %s(product_line_uuid, product_uuid)
        VALUES(:product_line_uuid, :product_uuid)
        """, DBTableName.PRODUCT_LINE_PRODUCT);
  }

  public static String SELECT_BY_FILTER(
      @Nullable UUID catalogUUID,
      @Nullable UUID brandUUID,
      @Nullable List<UUID> productLineUUIDs,
      @Nullable List<BigDecimal> priceRange,
      @Nullable Integer page,
      @Nullable Integer size,
      @Nullable String sort,
      @Nullable String search,
      Map<String, Object> params) {

    StringBuilder sql = new StringBuilder("SELECT DISTINCT p.* FROM products p");
    List<String> whereConditions = new ArrayList<>();
    whereConditions.add("p.is_deleted = 0");

    // Các biến cờ để tránh JOIN trùng lặp
    boolean joinedWithProductLine = false;
    boolean joinedWithBrand = false;
    boolean joinedWithCatalog = false;

    // Logic JOIN động dựa trên tham số lọc
    if (productLineUUIDs != null && !productLineUUIDs.isEmpty()) {
      String inClause = productLineUUIDs.stream()
          .map(uuid -> ":" + uuid.toString().replace("-", ""))
          .collect(Collectors.joining(", "));
      for (UUID uuid : productLineUUIDs) {
        params.put(uuid.toString().replace("-", ""), uuid);
      }
      sql.append(" JOIN product_line_products plp ON p.uuid = plp.product_uuid");
      whereConditions.add("plp.product_line_uuid IN (" + inClause + ")");
      joinedWithProductLine = true;
    }

    if (brandUUID != null) {
      if (!joinedWithProductLine) {
        sql.append(" JOIN product_line_products plp ON p.uuid = plp.product_uuid");
        joinedWithProductLine = true;
      }
      sql.append(" JOIN product_lines pl ON plp.product_line_uuid = pl.uuid");
      sql.append(" JOIN catalog_brands cb ON pl.reference_uuid = cb.uuid");
      sql.append(" JOIN brands b ON cb.brand_uuid = b.uuid");
      whereConditions.add("b.uuid = :brandUUID");
      params.put("brandUUID", brandUUID);
      joinedWithBrand = true;
    }

    if (catalogUUID != null) {
      if (!joinedWithBrand) {
        if (!joinedWithProductLine) {
          sql.append(" JOIN product_line_products plp ON p.uuid = plp.product_uuid");
          joinedWithProductLine = true;
        }
        sql.append(" JOIN product_lines pl ON plp.product_line_uuid = pl.uuid");
        sql.append(" JOIN catalog_brands cb ON pl.reference_uuid = cb.uuid");
        sql.append(" JOIN brands b ON cb.brand_uuid = b.uuid");
      }
      sql.append(" JOIN catalogs c ON cb.catalog_uuid = c.uuid");
      whereConditions.add("c.uuid = :catalogUUID");
      params.put("catalogUUID", catalogUUID);
      joinedWithCatalog = true;
    }

    // Thêm các điều kiện lọc chung
    if (priceRange != null && priceRange.size() == 2) {
      whereConditions.add("p.unit_price BETWEEN :minPrice AND :maxPrice");
      params.put("minPrice", priceRange.get(0));
      params.put("maxPrice", priceRange.get(1));
    }

    if (search != null && !search.isBlank()) {
      whereConditions.add("p.name LIKE :search");
      params.put("search", "%" + search + "%");
    }

    // Xây dựng mệnh đề WHERE
    if (!whereConditions.isEmpty()) {
      sql.append(" WHERE ").append(String.join(" AND ", whereConditions));
    }

    // Xử lý SORT
    String sortField = "p.uuid";
    String sortDirection = "ASC";
    if (sort != null && !sort.isBlank()) {
      String[] parts = sort.split(",");
      sortField = parts[0].trim();
      if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) {
        sortDirection = "DESC";
      }
    }
    sql.append(" ORDER BY ").append(sortField).append(" ").append(sortDirection);

    // Xử lý Pagination
    if (page != null && size != null && size > 0) {
      int safePage = Math.max(page, 0);
      int safeSize = Math.max(size, 1);
      int offset = safePage * safeSize;
      sql.append(" OFFSET ").append(offset).append(" ROWS FETCH NEXT ").append(safeSize).append(" ROWS ONLY");
    }

    return sql.toString();
  }

  public static String COUNT_BY_FILTER(
      @Nullable UUID catalogUUID,
      @Nullable UUID brandUUID,
      @Nullable List<UUID> productLineUUIDs,
      @Nullable List<BigDecimal> priceRange,
      @Nullable String search,
      Map<String, Object> params) {

    StringBuilder sql = new StringBuilder("SELECT COUNT(DISTINCT p.uuid) AS cnt FROM products p");
    List<String> whereConditions = new ArrayList<>();
    whereConditions.add("p.is_deleted = 0");

    // Các biến cờ để tránh JOIN trùng lặp
    boolean joinedWithProductLine = false;
    boolean joinedWithBrand = false;

    // Logic JOIN động dựa trên tham số lọc
    if (productLineUUIDs != null && !productLineUUIDs.isEmpty()) {
      String inClause = productLineUUIDs.stream()
          .map(uuid -> ":" + uuid.toString().replace("-", ""))
          .collect(Collectors.joining(", "));
      for (UUID uuid : productLineUUIDs) {
        params.put(uuid.toString().replace("-", ""), uuid);
      }
      sql.append(" JOIN product_line_products plp ON p.uuid = plp.product_uuid");
      whereConditions.add("plp.product_line_uuid IN (" + inClause + ")");
      joinedWithProductLine = true;
    }

    if (brandUUID != null) {
      if (!joinedWithProductLine) {
        sql.append(" JOIN product_line_products plp ON p.uuid = plp.product_uuid");
        joinedWithProductLine = true;
      }
      sql.append(" JOIN product_lines pl ON plp.product_line_uuid = pl.uuid");
      sql.append(" JOIN catalog_brands cb ON pl.reference_uuid = cb.uuid");
      sql.append(" JOIN brands b ON cb.brand_uuid = b.uuid");
      whereConditions.add("b.uuid = :brandUUID");
      params.put("brandUUID", brandUUID);
      joinedWithBrand = true;
    }

    if (catalogUUID != null) {
      if (!joinedWithBrand) {
        if (!joinedWithProductLine) {
          sql.append(" JOIN product_line_products plp ON p.uuid = plp.product_uuid");
          joinedWithProductLine = true;
        }
        sql.append(" JOIN product_lines pl ON plp.product_line_uuid = pl.uuid");
        sql.append(" JOIN catalog_brands cb ON pl.reference_uuid = cb.uuid");
        sql.append(" JOIN brands b ON cb.brand_uuid = b.uuid");
      }
      sql.append(" JOIN catalogs c ON cb.catalog_uuid = c.uuid");
      whereConditions.add("c.uuid = :catalogUUID");
      params.put("catalogUUID", catalogUUID);
    }

    // Add common filter conditions
    if (priceRange != null && priceRange.size() == 2) {
      whereConditions.add("p.unit_price BETWEEN :minPrice AND :maxPrice");
      params.put("minPrice", priceRange.get(0));
      params.put("maxPrice", priceRange.get(1));
    }

    if (search != null && !search.isBlank()) {
      whereConditions.add("p.name LIKE :search");
      params.put("search", "%" + search + "%");
    }

    // Build the WHERE clause
    if (!whereConditions.isEmpty()) {
      sql.append(" WHERE ").append(String.join(" AND ", whereConditions));
    }

    return sql.toString();
  }

  public static String SELECT_BY_UUID(UUID uuid, Map<String, Object> params) {
    params.put("uuid", uuid);
    return String.format("""
        SELECT *
        FROM %s
        WHERE uuid = :uuid
        """, DBTableName.PRODUCT);
  }

  public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
    params.put("uuid", uuid);
    return String.format("""
        UPDATE %s
        SET is_deleted = 1
        WHERE uuid = :uuid
        """, DBTableName.PRODUCT);
  }

  public static String UPDATE_NAME_BY_UUID(UUID uuid, String name, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("name", name);
    return String.format("""
        UPDATE %s
        SET name = :name
        WHERE uuid = :uuid
        """, DBTableName.PRODUCT);
  }

  public static String UPDATE_PHOTO_URL_BY_UUID(UUID uuid, String photoURL, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("photo_url", photoURL);
    return String.format("""
        UPDATE %s
        SET photo_url = :photo_url
        WHERE uuid = :uuid
        """, DBTableName.PRODUCT);
  }

  public static String UPDATE_PRICE_BY_UUID(UUID uuid, BigDecimal price, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("unit_price", price);
    return String.format("""
        UPDATE %s
        SET unit_price = :unit_price
        WHERE uuid = :uuid
        """, DBTableName.PRODUCT);
  }

  public static String UPDATE_STATUS_BY_UUID(UUID uuid, EProductStatus status, Map<String, Object> params) {
    params.put("uuid", uuid);
    params.put("status", status.name());
    return String.format("""
        UPDATE %s
        SET status = :status
        WHERE uuid = :uuid
        """, DBTableName.PRODUCT);
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
        """, DBTableName.PRODUCT);
  }
  // #endregion

  // #region product line
  public static String SELECT_PRODUCT_LINE_OF_PRODUCT(UUID productUUID, Map<String, Object> params) {
    params.put("product_uuid", productUUID);
    return String.format("""
        SELECT pl.*
        FROM %s AS plp
        JOIN %s AS pl
        ON plp.product_line_uuid = pl.uuid
        WHERE plp.product_uuid = :product_uuid
                """, DBTableName.PRODUCT_LINE_PRODUCT, DBTableName.PRODUCT_LINE);
  }

  // #endregion

  // #region statistics
  public static String SELECT_PRODUCT_STATUS_STATISTICS() {
    return String.format("""
        SELECT status, COUNT(uuid) AS total_count
        FROM %s
        GROUP BY status
                """, DBTableName.PRODUCT);
  }
  // #endregion

  public static String GET_PRODUCT_INFO(UUID uuid, Map<String, Object> params) {
    params.put("uuid", uuid);
    return """
            SELECT (
              SELECT
            p.uuid,
            p.name,
            p.unit_price,

            -- Brand
            (
                SELECT TOP 1 br.name
                FROM product_line_products AS plp
                JOIN product_lines AS pl ON pl.uuid = plp.product_line_uuid
                JOIN catalog_brands AS cb ON pl.reference_uuid = cb.uuid
                JOIN brands AS br ON br.uuid = cb.brand_uuid
                WHERE plp.product_uuid = p.uuid
            ) AS brand,

            -- Catalog
            (
                SELECT TOP 1 ct.name
                FROM product_line_products AS plp
                JOIN product_lines AS pl ON pl.uuid = plp.product_line_uuid
                JOIN catalog_brands AS cb ON pl.reference_uuid = cb.uuid
                JOIN catalogs AS ct ON ct.uuid = cb.catalog_uuid
                WHERE plp.product_uuid = p.uuid
            ) AS catalog,

            -- Attributes
            (
                SELECT
                    attr.name AS attribute_name,
                    pav.value AS attribute_value
                FROM product_attributes AS pa
                JOIN product_attribute_values AS pav ON pa.uuid = pav.reference_uuid
                JOIN attributes AS attr ON attr.uuid = pa.attribute_uuid
                WHERE pa.product_uuid = p.uuid
                FOR JSON PATH
            ) AS attributes,

            -- Product lines: mảng string
            (
                SELECT pl.name
                FROM product_line_products AS plp
                JOIN product_lines AS pl ON pl.uuid = plp.product_line_uuid
                WHERE plp.product_uuid = p.uuid
                FOR JSON PATH
            ) AS product_lines

        FROM products AS p
        where p.uuid = :uuid
        FOR JSON PATH
            ) AS json_result;

            """;
  }

}
