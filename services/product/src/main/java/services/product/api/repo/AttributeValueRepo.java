package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import services.product.core.sql.AttributeValueSQL;

@Repository
@RequiredArgsConstructor
public class AttributeValueRepo {
        private final DatabaseClient databaseClient;

        // #region CRUD
        public Mono<Long> deleteValue(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeValueSQL.DELETE_BY_UUID(uuid, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }
        // #endregion

}
