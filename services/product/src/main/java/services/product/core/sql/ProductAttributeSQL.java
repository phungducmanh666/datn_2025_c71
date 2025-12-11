package services.product.core.sql;

import java.util.Map;
import java.util.UUID;

import services.product.core.constance.DBTableName;

public class ProductAttributeSQL {
    // #region crud
    public static String ADD_PRODUCT_ATTRIBUTE(UUID productUUID, UUID attributeUUID, Map<String, Object> params) {
        params.put("product_uuid", productUUID);
        params.put("attribute_uuid", attributeUUID);
        return String.format("""
                INSERT INTO %s(product_uuid, attribute_uuid)
                VALUES(:product_uuid, :attribute_uuid)
                """, DBTableName.PRODUCT_ATTRIBUTE);
    }

    public static String UPSERT_PRODUCT_ATTRIBUTE(UUID productUUID, UUID attributeUUID, Map<String, Object> params) {
        params.put("product_uuid", productUUID);
        params.put("attribute_uuid", attributeUUID);
        return String.format("""
                MERGE INTO %s AS target
                USING (VALUES (:product_uuid, :attribute_uuid)) AS source(product_uuid, attribute_uuid)
                    ON target.product_uuid = source.product_uuid
                   AND target.attribute_uuid = source.attribute_uuid
                WHEN NOT MATCHED THEN
                    INSERT (product_uuid, attribute_uuid)
                    VALUES (source.product_uuid, source.attribute_uuid);
                """, DBTableName.PRODUCT_ATTRIBUTE);
    }

    public static String SELECT_ATTRIBUTE_VALUES_BY_PRODUCT_UUID(UUID productUUID, Map<String, Object> params) {
        params.put("product_uuid", productUUID);
        return String.format("""
                SELECT
                    ag.uuid AS uuid,
                    ag.name AS name,
                    (
                        SELECT
                            a.uuid AS uuid,
                            a.name AS name,
                            (
                                SELECT
                                    pav.uuid AS uuid,
                                    pav.value AS [value]
                                FROM %s pav
                                WHERE pav.reference_uuid = pa.uuid
                                FOR JSON PATH
                            ) AS [values]
                        FROM %s a
                        JOIN %s pa ON pa.attribute_uuid = a.uuid
                        WHERE pa.product_uuid = :product_uuid
                          AND a.reference_uuid = ag.uuid
                        FOR JSON PATH
                    ) AS attributes
                FROM %s ag
                WHERE EXISTS (
                    SELECT 1 FROM %s a
                    JOIN %s pa ON pa.attribute_uuid = a.uuid
                    WHERE pa.product_uuid = :product_uuid
                      AND a.reference_uuid = ag.uuid
                )
                FOR JSON PATH
                """,
                DBTableName.PRODUCT_ATTRIBUTE_VALUE,
                DBTableName.ATTRIBUTE,
                DBTableName.PRODUCT_ATTRIBUTE,
                DBTableName.ATTRIBUTE_GROUP,
                DBTableName.ATTRIBUTE,
                DBTableName.PRODUCT_ATTRIBUTE);
    }

    public static String SELECT_ATTRIBUTE_VALUES_FLAT(UUID productUUID, Map<String, Object> params) {
        params.put("product_uuid", productUUID);
        return String.format("""
                SELECT
                    ag.uuid AS group_uuid,
                    ag.name AS group_name,
                    a.uuid AS attr_uuid,
                    a.name AS attr_name,
                    pav.uuid AS value_uuid,
                    pav.value AS value_text
                FROM %s ag
                JOIN %s a ON a.reference_uuid = ag.uuid
                JOIN %s pa ON pa.attribute_uuid = a.uuid
                LEFT JOIN %s pav ON pav.reference_uuid = pa.uuid
                WHERE pa.product_uuid = :product_uuid
                ORDER BY ag.uuid, a.uuid, pav.uuid
                """,
                DBTableName.ATTRIBUTE_GROUP,
                DBTableName.ATTRIBUTE,
                DBTableName.PRODUCT_ATTRIBUTE,
                DBTableName.PRODUCT_ATTRIBUTE_VALUE);
    }

    public static String DELETE_BY_PRODUCT_UUID_AND_ATTRIBUTE_UUID(UUID productUUID, UUID attributeUUID,
            Map<String, Object> params) {
        params.put("product_uuid", productUUID);
        params.put("attribute_uuid", attributeUUID);
        return String.format("""
                DELETE
                FROM %s
                WHERE attribute_uuid = :attribute_uuid
                AND product_uuid = :product_uuid
                """, DBTableName.PRODUCT_ATTRIBUTE);
    }
    // #endregion

    // #region attribute value
    public static String ADD_ATTRIBUTE_VALUE(UUID productUUID, UUID attributeUUID, String value,
            Map<String, Object> params) {
        params.put("product_uuid", productUUID);
        params.put("attribute_uuid", attributeUUID);
        params.put("value", value);

        return String.format("""
                INSERT INTO %s(reference_uuid, value)
                SELECT pa.uuid, :value
                FROM %s pa
                WHERE pa.product_uuid = :product_uuid
                  AND pa.attribute_uuid = :attribute_uuid
                """,
                DBTableName.PRODUCT_ATTRIBUTE_VALUE,
                DBTableName.PRODUCT_ATTRIBUTE);
    }

    public static String DELETE_ATTRIBUTE_VALUE(UUID valueUUID, Map<String, Object> params) {
        params.put("uuid", valueUUID);
        return String.format("""
                DELETE FROM %s
                WHERE uuid = :uuid
                """, DBTableName.PRODUCT_ATTRIBUTE_VALUE);
    }
    // #endregion

}
