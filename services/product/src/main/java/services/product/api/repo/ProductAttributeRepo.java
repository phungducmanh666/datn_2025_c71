package services.product.api.repo;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.core.model.database.AttributeData;
import services.product.core.model.database.AttributeGroupData;
import services.product.core.model.database.AttributeValueData;
import services.product.core.model.tmp.FlatAttributeRow;
import services.product.core.sql.ProductAttributeSQL;
import services.product.helper.JsonLogger;
import services.product.helper.JsonUtils;

@Repository
@RequiredArgsConstructor
public class ProductAttributeRepo {

        private final DatabaseClient databaseClient;

        // #region CRUD
        public Mono<Void> addProductAttribute(UUID productUUID, UUID attributeUUID) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(ProductAttributeSQL.UPSERT_PRODUCT_ATTRIBUTE(productUUID, attributeUUID, params))
                                .bindValues(params)
                                .then();
        }

        public Mono<Long> deleteByProductUUIDAndAttributeUUID(UUID productUUID, UUID attributeUUID) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(ProductAttributeSQL.DELETE_BY_PRODUCT_UUID_AND_ATTRIBUTE_UUID(
                                productUUID, attributeUUID, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }

        public Flux<AttributeGroupData> getProductAttributesFlat(UUID productUUID) {
                Map<String, Object> params = new HashMap<>();
                String sql = ProductAttributeSQL.SELECT_ATTRIBUTE_VALUES_BY_PRODUCT_UUID(productUUID, params);

                return databaseClient.sql(sql)
                                .bindValues(params)
                                .map((row, meta) -> row.get(0, String.class)) // Lấy JSON
                                .all()
                                .flatMap(json -> {
                                        JsonLogger.logObject(json);
                                        return Flux
                                                        .fromIterable(JsonUtils.parseJson(json,
                                                                        AttributeGroupData.class));
                                });
        }

        public Flux<AttributeGroupData> getProductAttributes(UUID productUUID) {
                Map<String, Object> params = new HashMap<>();
                String sql = ProductAttributeSQL.SELECT_ATTRIBUTE_VALUES_FLAT(productUUID, params);

                return databaseClient.sql(sql)
                                .bindValues(params)
                                .map((row, meta) -> new FlatAttributeRow(
                                                row.get("group_uuid", UUID.class),
                                                row.get("group_name", String.class),
                                                row.get("attr_uuid", UUID.class),
                                                row.get("attr_name", String.class),
                                                row.get("value_uuid", UUID.class),
                                                row.get("value_text", String.class)))
                                .all()
                                .collectList()
                                .flatMapMany(this::groupAttributeData);
        }

        private Flux<AttributeGroupData> groupAttributeData(List<FlatAttributeRow> rows) {
                // Group by attribute group
                Map<UUID, AttributeGroupData> groupMap = new LinkedHashMap<>();

                for (FlatAttributeRow row : rows) {
                        // Get or create attribute group
                        AttributeGroupData group = groupMap.computeIfAbsent(
                                        row.getGroupUuid(),
                                        k -> {
                                                AttributeGroupData g = new AttributeGroupData();
                                                g.setUuid(row.getGroupUuid());
                                                g.setName(row.getGroupName());
                                                return g;
                                        });

                        // Find or create attribute in this group
                        AttributeData attribute = group.getAttributes().stream()
                                        .filter(a -> a.getUuid().equals(row.getAttrUuid()))
                                        .findFirst()
                                        .orElseGet(() -> {
                                                AttributeData a = new AttributeData();
                                                a.setUuid(row.getAttrUuid());
                                                a.setName(row.getAttrName());
                                                group.getAttributes().add(a);
                                                return a;
                                        });

                        // Add value if exists
                        if (row.getValueUuid() != null) {
                                AttributeValueData value = new AttributeValueData();
                                value.setUuid(row.getValueUuid());
                                value.setValue(row.getValueText());
                                attribute.getValues().add(value);
                        }
                }

                return Flux.fromIterable(groupMap.values());
        }
        // #endregion

        // #region attribute value

        public Mono<Void> addAttributeValue(UUID productUUID, UUID attributeUUID, String value) {
                Map<String, Object> params = new HashMap<>();
                String sql = ProductAttributeSQL.ADD_ATTRIBUTE_VALUE(productUUID, attributeUUID, value, params);
                return databaseClient.sql(sql)
                                .bindValues(params)
                                .then();
        }

        public Mono<Long> deleteAttributeValue(UUID valueUUID) {
                Map<String, Object> params = new HashMap<>();
                String sql = ProductAttributeSQL.DELETE_ATTRIBUTE_VALUE(valueUUID, params);
                return databaseClient.sql(sql)
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }
        // #endregion
}
