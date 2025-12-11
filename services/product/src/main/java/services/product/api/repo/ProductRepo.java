package services.product.api.repo;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.lang.Nullable;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.reactive.TransactionalOperator;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.ProductLineRowMapper;
import services.product.api.mapper.ProductRowMapper;
import services.product.api.mapper.ProductStatusStatisticsRowMapper;
import services.product.core.constance.DBTableName;
import services.product.core.eum.EProductStatus;
import services.product.core.mapper.SQLMapper;
import services.product.core.model.database.ProductData;
import services.product.core.model.database.ProductLineData;
import services.product.core.model.database.ProductStatusStatisticData;
import services.product.core.model.request.RequestCreateProductData;
import services.product.core.sql.ProductSQL;

@Repository
@RequiredArgsConstructor
public class ProductRepo {

  private final DatabaseClient databaseClient;
  private final TransactionalOperator txOperator;
  private final ProductLineRepo productLineRepo; // dùng lại repo sẵn có

  // #region create
  public Mono<UUID> createProduct(RequestCreateProductData req) {
    return txOperator.transactional(
        getProductLines(req)
            .flatMap(productLineUUIDs -> createProductRow(req)
                .flatMap(productUUID -> linkProductLines(productUUID, productLineUUIDs)
                    .thenReturn(productUUID))));
  }

  private Mono<List<UUID>> getProductLines(RequestCreateProductData req) {
    if (!req.getMetadata().getProductLineUUIDS().isEmpty()) {
      return Mono.just(req.getMetadata().getProductLineUUIDS());
    }
    // dùng lại ProductLineRepo để lấy hoặc tạo default line
    return productLineRepo.getDefaultOrCreate(
        req.getMetadata().getCatalogUUID(),
        req.getMetadata().getBrandUUID())
        .map(line -> List.of(line.getUuid()));
  }

  private Mono<UUID> createProductRow(RequestCreateProductData req) {
    Map<String, Object> params = new HashMap<>();
    String sql = ProductSQL.CREATE_PRODUCT(req.getInfo().getName(), req.getInfo().getPhotoUrl(),
        req.getInfo().getPrice(), EProductStatus.ACTIVE,
        params);
    return databaseClient.sql(sql)
        .bindValues(params)
        .map(row -> row.get("uuid", UUID.class))
        .one();
  }

  public Mono<String> getProductInfo(UUID productUUID) {
    Map<String, Object> params = new HashMap<>();
    String sql = ProductSQL.GET_PRODUCT_INFO(productUUID, params);
    return databaseClient.sql(sql)
        .bindValues(params)
        .map(row -> row.get("json_result", String.class))
        .one();
  }

  private Mono<Void> linkProductLines(UUID productUUID, List<UUID> productLineUUIDs) {
    return Flux.fromIterable(productLineUUIDs)
        .flatMap(plUUID -> {
          Map<String, Object> params = new HashMap<>();
          String sql = ProductSQL.LINK_PRODUCT_LINE(productUUID, plUUID, params);
          return databaseClient.sql(sql).bindValues(params).fetch().rowsUpdated();
        })
        .then();
  }

  // private Mono<Void> createVariants(UUID productUUID, RequestCreateProductData
  // req) {
  // var variants = req.getVariants().isEmpty()
  // ? List.of(new RequestCreateProductData.ProductVariant("DEFAULT",
  // req.getInfo().getPrice(), List.of()))
  // : req.getVariants();

  // return Flux.fromIterable(variants)
  // .flatMap(v -> {
  // Map<String, Object> params = new HashMap<>();
  // String sql = ProductSQL.CREATE_VARIANT(productUUID, v.getSku(), v.getPrice(),
  // params);
  // return databaseClient.sql(sql)
  // .bindValues(params)
  // .map(row -> row.get("uuid", UUID.class))
  // .one()
  // .flatMap(variantUUID -> linkVariantOptions(variantUUID, v.getOptionUUIDS()));
  // })
  // .then();
  // }

  // private Mono<Void> linkVariantOptions(UUID variantUUID, List<UUID>
  // optionUUIDs) {
  // if (optionUUIDs.isEmpty()) {
  // return Mono.empty();
  // }

  // return Flux.range(0, optionUUIDs.size()) // dùng index làm level
  // .flatMap(i -> {
  // UUID optionUUID = optionUUIDs.get(i);
  // int level = i; // hoặc i + 1 nếu muốn level bắt đầu từ 1

  // Map<String, Object> params = new HashMap<>();
  // String sql = ProductSQL.LINK_VARIANT_OPTION(variantUUID, optionUUID, level,
  // params);

  // return databaseClient.sql(sql)
  // .bindValues(params)
  // .fetch()
  // .rowsUpdated();
  // })
  // .then();
  // }

  // #endregion

  public Flux<ProductData> getByFilter(
      @Nullable UUID catalogUUID,
      @Nullable UUID brandUUID,
      @Nullable List<UUID> productLineUUIDS,
      @Nullable List<BigDecimal> priceRange,
      @Nullable Integer page,
      @Nullable Integer size,
      @Nullable String sort,
      @Nullable String search) {

    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(ProductSQL.SELECT_BY_FILTER(catalogUUID, brandUUID, productLineUUIDS, priceRange, page, size, sort, search,
            params))
        .bindValues(params)
        .map(ProductRowMapper.MAP)
        .all();
  }

  public Mono<Long> countByFilter(
      @Nullable UUID catalogUUID,
      @Nullable UUID brandUUID,
      @Nullable List<UUID> productLineUUIDS,
      @Nullable List<BigDecimal> priceRange,
      @Nullable String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.COUNT_BY_FILTER(catalogUUID, brandUUID, productLineUUIDS, priceRange, search,
        params))
        .bindValues(params)
        .map(SQLMapper.CNT_MAPPER)
        .one();
  }

  public Mono<ProductData> getProductByUUID(UUID productUUID) {
    Map<String, Object> params = new HashMap<>();
    params.put("uuid", productUUID);
    String sql = String.format("SELECT * FROM %s WHERE uuid = :uuid", DBTableName.PRODUCT);
    return databaseClient.sql(sql)
        .bindValues(params)
        .map(ProductRowMapper.MAP)
        .one();
  }

  public Mono<Long> updateNameByUUID(UUID uuid, String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.UPDATE_NAME_BY_UUID(uuid, name, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updatePhotoURLByUUID(UUID uuid, String photoURL) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.UPDATE_PHOTO_URL_BY_UUID(uuid, photoURL, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updateStatusByUUID(UUID uuid, EProductStatus status) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.UPDATE_STATUS_BY_UUID(uuid, status, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updatePriceByUUID(UUID uuid, BigDecimal price) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.UPDATE_PRICE_BY_UUID(uuid, price, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> deleteByUUID(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.DELETE_BY_UUID(uuid, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Boolean> existsByName(String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.CHECK_NAME_EXISTS(name, params))
        .bindValues(params)
        .map(SQLMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }

  // #region product line
  public Flux<ProductLineData> getProductLines(UUID productUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.SELECT_PRODUCT_LINE_OF_PRODUCT(productUUID, params))
        .bindValues(params)
        .map(ProductLineRowMapper.MAP).all();
  }

  // #endregion

  // #region statistics
  public Flux<ProductStatusStatisticData> getProductStatisStatistics() {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(ProductSQL.SELECT_PRODUCT_STATUS_STATISTICS())
        .bindValues(params)
        .map(ProductStatusStatisticsRowMapper.MAP).all();
  }
  // #endregion

}
