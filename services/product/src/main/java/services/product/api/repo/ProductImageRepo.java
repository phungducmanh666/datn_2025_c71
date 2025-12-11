package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.ProductImageRowMapper;
import services.product.core.model.database.ProductImageData;
import services.product.core.sql.ProductImageSQL;

@Repository
@RequiredArgsConstructor
public class ProductImageRepo {
        private final DatabaseClient databaseClient;

        // #region CRUD
        public Mono<Void> addProductImage(UUID productUUID, String photoUrl) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(ProductImageSQL.ADD_PRODUCT_IMAGE(productUUID, photoUrl, params))
                                .bindValues(params)
                                .then();
        }

        public Flux<ProductImageData> getProductImages(UUID productUUID) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(ProductImageSQL.SELECT_BY_PRODUCT_UUID(productUUID, params))
                                .bindValues(params)
                                .map(ProductImageRowMapper.MAP)
                                .all();
        }

        public Mono<Long> deleteByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(ProductImageSQL.DELETE_BY_UUID(uuid, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }
        // #endregion
}
