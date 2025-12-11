package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class ProductImageSQL {
    // #region crud
    public static String ADD_PRODUCT_IMAGE(UUID productUUID, String photoURL, Map<String, Object> params) {
        params.put("photo_url", photoURL);
        params.put("reference_uuid", productUUID);
        return String.format("""
                INSERT INTO %s(reference_uuid, photo_url)
                VALUES(:reference_uuid, :photo_url)
                """, DBTableName.PRODUCT_IMAGE);
    }

    public static String SELECT_BY_PRODUCT_UUID(UUID productUUID, Map<String, Object> params) {
        params.put("reference_uuid", productUUID);
        return String.format("""
                SELECT *
                FROM %s
                WHERE reference_uuid = :reference_uuid
                ORDER BY [order]
                """,
                DBTableName.PRODUCT_IMAGE);
    }

    public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                DELETE
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.PRODUCT_IMAGE);
    }
    // #endregion

}
