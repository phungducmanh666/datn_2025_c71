package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.ProductLineRowMapper;
import services.product.core.mapper.SQLMapper;
import services.product.core.model.database.ProductLineData;
import services.product.core.sql.ProductLineSQL;

@Repository
@RequiredArgsConstructor
public class ProductLineRepo {

  private final CatalogBrandRepo catalogBrandRepo;
  private final DatabaseClient databaseClient;

  // #region crud

  public Mono<ProductLineData> create(UUID catalogUUID, UUID brandUUID, String name) {
    return catalogBrandRepo.getCatalogBrandUUID(catalogUUID, brandUUID)
        .flatMap(catalogBrandUUID -> {
          Map<String, Object> params = new HashMap<>();
          String sql = ProductLineSQL.CREATE_NAME_ONLY_SQL(catalogBrandUUID, name, params);

          return databaseClient.sql(sql)
              .bindValues(params)
              .map(ProductLineRowMapper.MAP)
              .one(); // Trả về 1 ProductLineData duy nhất
        });
  }

  public Mono<ProductLineData> getByUUID(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(ProductLineSQL.SELECT_BY_UUID(uuid, params))
        .bindValues(params)
        .map(ProductLineRowMapper.MAP)
        .one();
  }

  public Flux<ProductLineData> getByFilter(UUID catalogUUID, UUID brandUUID, Integer page, Integer size, String sort,
      String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductLineSQL.SELECT_BY_FILTER(catalogUUID, brandUUID, page, size, sort, search, params))
        .bindValues(params)
        .map(ProductLineRowMapper.MAP)
        .all();
  }

  public Mono<Long> updateNameByUUID(UUID uuid, String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductLineSQL.UPDATE_NAME(uuid, name, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> deleteByUUID(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductLineSQL.DELETE_BY_UUID(uuid, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  // #endregion

  // #region checking
  public Mono<Long> countByFilter(UUID catalogUUID, UUID brandUUID, String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductLineSQL.COUNT_BY_FILTER(catalogUUID, brandUUID, search, params))
        .bindValues(params)
        .map(SQLMapper.CNT_MAPPER)
        .one();
  }

  public Mono<Boolean> existsByName(UUID catalogUUID, UUID brandUUID, String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductLineSQL.CHECK_NAME_EXISTS(catalogUUID, brandUUID, name, params))
        .bindValues(params)
        .map(SQLMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }
  // #endregion

  // #region default product line
  public Mono<ProductLineData> getDefaultOrCreate(UUID catalogUUID, UUID brandUUID) {
    return catalogBrandRepo.getCatalogBrandUUID(catalogUUID, brandUUID)
        .flatMap(this::getOrCreateDefaultLine);
  }

  private Mono<ProductLineData> getOrCreateDefaultLine(UUID catalogBrandUUID) {
    return getDefaultLine(catalogBrandUUID)
        .switchIfEmpty(createDefaultLine(catalogBrandUUID));
  }

  private Mono<ProductLineData> getDefaultLine(UUID catalogBrandUUID) {
    Map<String, Object> params = new HashMap<>();
    String sql = ProductLineSQL.GET_DEFAULT(catalogBrandUUID, params);

    return databaseClient.sql(sql)
        .bindValues(params)
        .map(ProductLineRowMapper.MAP)
        .one();
  }

  private Mono<ProductLineData> createDefaultLine(UUID catalogBrandUUID) {
    Map<String, Object> params = new HashMap<>();
    String sql = ProductLineSQL.CREATE_DEFAULT(catalogBrandUUID, params);

    return databaseClient.sql(sql)
        .bindValues(params)
        .map(ProductLineRowMapper.MAP)
        .one();
  }
  // #endregion

}
