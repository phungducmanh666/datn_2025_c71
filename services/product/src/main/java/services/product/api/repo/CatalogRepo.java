package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.CatalogRowMapper;
import services.product.core.mapper.SQLMapper;
import services.product.core.model.database.CatalogData;
import services.product.core.sql.CatalogSQL;

@Repository
@RequiredArgsConstructor
public class CatalogRepo {
        private final DatabaseClient databaseClient;

        // #region CRUD
        public Mono<CatalogData> create(String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(CatalogSQL.CREATE_NAME_ONLY_SQL(name, params))
                                .bindValues(params)
                                .map(CatalogRowMapper.MAP)
                                .one();
        }

        public Mono<CatalogData> getByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(CatalogSQL.SELECT_BY_UUID(uuid, params))
                                .bindValues(params)
                                .map(CatalogRowMapper.MAP)
                                .one();
        }

        public Flux<CatalogData> getByFilter(Integer page, Integer size, String sort, String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(CatalogSQL.SELECT_BY_FILTER(page, size, sort, search, params))
                                .bindValues(params)
                                .map(CatalogRowMapper.MAP)
                                .all();
        }

        public Mono<Long> updateNameByUUID(UUID uuid, String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(CatalogSQL.UPDATE_NAME(uuid, name, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }

        public Mono<Long> updatePhotoUrlByUUID(UUID uuid, String photoUrl) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(CatalogSQL.UPDATE_PHOTO_URL(uuid, photoUrl, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }

        public Mono<Long> deleteByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(CatalogSQL.DELETE_BY_UUID(uuid, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }
        // #endregion

        // #region checking
        public Mono<Long> countByFilter(String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(CatalogSQL.COUNT_BY_FILTER(search, params))
                                .bindValues(params)
                                .map(SQLMapper.CNT_MAPPER)
                                .one();
        }

        public Mono<Boolean> existsByName(String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(CatalogSQL.CHECK_NAME_EXISTS(name, params))
                                .bindValues(params)
                                .map(SQLMapper.EXISTS_MAPPER)
                                .one()
                                .defaultIfEmpty(false);
        }
        // #endregion

}
