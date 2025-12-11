package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.AttributeRowMapper;
import services.product.core.mapper.SQLMapper;
import services.product.core.model.database.AttributeData;
import services.product.core.sql.AttributeSQL;

@Repository
@RequiredArgsConstructor
public class AttributeRepo {
        private final DatabaseClient databaseClient;

        // #region CRUD
        public Mono<AttributeData> create(UUID groupUUID, String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(AttributeSQL.CREATE_NAME_ONLY_SQL(groupUUID, name, params))
                                .bindValues(params)
                                .map(AttributeRowMapper.MAP)
                                .one();
        }

        public Mono<AttributeData> getByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(AttributeSQL.SELECT_BY_UUID(uuid, params))
                                .bindValues(params)
                                .map(AttributeRowMapper.MAP)
                                .one();
        }

        public Flux<AttributeData> getByFilter(UUID groupUUID, Integer page, Integer size, String sort, String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeSQL.SELECT_BY_FILTER(groupUUID, page, size, sort, search, params))
                                .bindValues(params)
                                .map(AttributeRowMapper.MAP)
                                .all();
        }

        public Mono<Long> updateNameByUUID(UUID uuid, String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeSQL.UPDATE_NAME(uuid, name, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }

        public Mono<Long> deleteByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeSQL.DELETE_BY_UUID(uuid, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }
        // #endregion

        // #region checking
        public Mono<Long> countByFilter(UUID groupUUID, String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeSQL.COUNT_BY_FILTER(groupUUID, search, params))
                                .bindValues(params)
                                .map(SQLMapper.CNT_MAPPER)
                                .one();
        }

        public Mono<Boolean> existsByName(UUID groupUUID, String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeSQL.CHECK_NAME_EXISTS(groupUUID, name, params))
                                .bindValues(params)
                                .map(SQLMapper.EXISTS_MAPPER)
                                .one()
                                .defaultIfEmpty(false);
        }
        // #endregion

        // #region by catalog

        // #endregion
}
