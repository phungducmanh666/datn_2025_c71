package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class AttributeValueSQL {
    // #region crud
    public static String DELETE_BY_UUID(UUID uuid, Map<String, Object> params) {
        params.put("uuid", uuid);
        return String.format("""
                DELETE
                FROM %s
                WHERE uuid = :uuid
                """, DBTableName.PRODUCT_ATTRIBUTE_VALUE);
    }
    // #endregion

}
