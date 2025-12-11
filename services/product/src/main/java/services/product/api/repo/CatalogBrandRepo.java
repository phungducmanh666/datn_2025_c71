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
import services.product.core.sql.CatalogBrandSQL;

@Repository
@RequiredArgsConstructor
public class CatalogBrandRepo {
  private final DatabaseClient databaseClient;

  // #region CRUD
  public Mono<Void> createConnection(UUID catalogUUID, UUID brandUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(CatalogBrandSQL.CREATE_CATALOG_BRAND_CONNECTION(catalogUUID, brandUUID, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated()
        .then(); // trả về Mono<Void>
  }

  public Mono<Long> removeConnection(UUID catalogUUID, UUID brandUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(CatalogBrandSQL.REMOVE_CATALOG_BRAND_CONNECTION(catalogUUID, brandUUID, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Flux<BrandData> getByCatalogAndFilter(UUID catalogUUID, Integer page, Integer size, String sort,
      String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(CatalogBrandSQL.SELECT_BY_CATALOG_AND_FILTER(catalogUUID, page, size, sort, search, params))
        .bindValues(params)
        .map(BrandRowMapper.MAP)
        .all();
  }
  // #endregion

  // #region checking
  public Mono<Long> countByCatalogFilter(UUID catalogUUID, String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CatalogBrandSQL.COUNT_BY_CATALOG_AND_FILTER(catalogUUID, search, params))
        .bindValues(params)
        .map(SQLMapper.CNT_MAPPER)
        .one();
  }

  public Mono<Boolean> pairsExists(UUID catalogUUID, UUID brandUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CatalogBrandSQL.CHECK_PAIR_EXISTS(catalogUUID, brandUUID, params))
        .bindValues(params)
        .map(SQLMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }
  // #endregion

  public Mono<UUID> getCatalogBrandUUID(UUID catalogUUID, UUID brandUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(CatalogBrandSQL.SELECT_CATALOG_BRAND(catalogUUID, brandUUID, params))
        .bindValues(params)
        .map((row, metadata) -> row.get("uuid", UUID.class))
        .one(); // Trả về Mono<UUID>
  }

}
