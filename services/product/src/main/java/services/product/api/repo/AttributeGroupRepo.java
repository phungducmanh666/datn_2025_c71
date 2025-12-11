package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.AttributeGroupRowMapper;
import services.product.core.mapper.SQLMapper;
import services.product.core.model.database.AttributeGroupData;
import services.product.core.sql.AttributeGroupSQL;

@Repository
@RequiredArgsConstructor
public class AttributeGroupRepo {
        private final DatabaseClient databaseClient;

        // #region CRUD
        public Mono<AttributeGroupData> create(String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(AttributeGroupSQL.CREATE_NAME_ONLY_SQL(name, params))
                                .bindValues(params)
                                .map(AttributeGroupRowMapper.MAP)
                                .one();
        }

        public Mono<AttributeGroupData> getByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(AttributeGroupSQL.SELECT_BY_UUID(uuid, params))
                                .bindValues(params)
                                .map(AttributeGroupRowMapper.MAP)
                                .one();
        }

        public Flux<AttributeGroupData> getByFilter(Integer page, Integer size, String sort, String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeGroupSQL.SELECT_BY_FILTER(page, size, sort, search, params))
                                .bindValues(params)
                                .map(AttributeGroupRowMapper.MAP2)
                                .all();
        }

        public Mono<Long> updateNameByUUID(UUID uuid, String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeGroupSQL.UPDATE_NAME(uuid, name, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }

        public Mono<Long> deleteByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeGroupSQL.DELETE_BY_UUID(uuid, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }
        // #endregion

        // #region checking
        public Mono<Long> countByFilter(String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeGroupSQL.COUNT_BY_FILTER(search, params))
                                .bindValues(params)
                                .map(SQLMapper.CNT_MAPPER)
                                .one();
        }

        public Mono<Boolean> existsByName(String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(AttributeGroupSQL.CHECK_NAME_EXISTS(name, params))
                                .bindValues(params)
                                .map(SQLMapper.EXISTS_MAPPER)
                                .one()
                                .defaultIfEmpty(false);
        }
        // #endregion

        // #region by catalog

        // #endregion
}
