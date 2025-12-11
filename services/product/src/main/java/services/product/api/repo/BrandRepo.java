package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.BrandRowMapper;
import services.product.core.mapper.SQLMapper;
import services.product.core.model.database.BrandData;
import services.product.core.sql.BrandSQL;

@Repository
@RequiredArgsConstructor
public class BrandRepo {
        private final DatabaseClient databaseClient;

        // #region CRUD
        public Mono<BrandData> create(String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(BrandSQL.CREATE_NAME_ONLY_SQL(name, params))
                                .bindValues(params)
                                .map(BrandRowMapper.MAP)
                                .one();
        }

        public Mono<BrandData> getByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient
                                .sql(BrandSQL.SELECT_BY_UUID(uuid, params))
                                .bindValues(params)
                                .map(BrandRowMapper.MAP)
                                .one();
        }

        public Flux<BrandData> getByFilter(Integer page, Integer size, String sort, String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(BrandSQL.SELECT_BY_FILTER(page, size, sort, search, params))
                                .bindValues(params)
                                .map(BrandRowMapper.MAP)
                                .all();
        }

        public Mono<Long> updateNameByUUID(UUID uuid, String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(BrandSQL.UPDATE_NAME(uuid, name, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }

        public Mono<Long> updatePhotoUrlByUUID(UUID uuid, String photoUrl) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(BrandSQL.UPDATE_PHOTO_URL(uuid, photoUrl, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }

        public Mono<Long> deleteByUUID(UUID uuid) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(BrandSQL.DELETE_BY_UUID(uuid, params))
                                .bindValues(params)
                                .fetch()
                                .rowsUpdated();
        }
        // #endregion

        // #region checking
        public Mono<Long> countByFilter(String search) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(BrandSQL.COUNT_BY_FILTER(search, params))
                                .bindValues(params)
                                .map(SQLMapper.CNT_MAPPER)
                                .one();
        }

        public Mono<Boolean> existsByName(String name) {
                Map<String, Object> params = new HashMap<>();
                return databaseClient.sql(BrandSQL.CHECK_NAME_EXISTS(name, params))
                                .bindValues(params)
                                .map(SQLMapper.EXISTS_MAPPER)
                                .one()
                                .defaultIfEmpty(false);
        }
        // #endregion

        // #region by catalog

        // #endregion
}
