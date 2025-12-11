package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.CommonMapper;
import services.product.api.mapper.PermissionRowMapper;
import services.product.core.model.database.PermissionData;
import services.product.core.sql.PermissionSQL;

@Repository
@RequiredArgsConstructor
public class PermissionRepo {
  private final DatabaseClient databaseClient;

  public Mono<PermissionData> createPermission(String name, String description) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(PermissionSQL.CREATE_PERMISSION(name, description, params))
        .bindValues(params)
        .map(PermissionRowMapper.MAP)
        .one();
  }

  public Mono<PermissionData> getPermissionByName(String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(PermissionSQL.SELECT_BY_NAME(name, params))
        .bindValues(params)
        .map(PermissionRowMapper.MAP)
        .one();
  }

  public Flux<PermissionData> getPermissions(String sort) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(PermissionSQL.SELECT_ALL_PERMISSIONS(sort, params))
        .bindValues(params)
        .map(PermissionRowMapper.MAP)
        .all();
  }

  public Mono<Boolean> existsByName(String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(PermissionSQL.CHECK_NAME_EXISTS(name, params))
        .bindValues(params)
        .map(CommonMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }

  public Mono<Long> deletePermission(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(PermissionSQL.DELETE_BY_UUID(uuid, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> countAllPermission() {
    return databaseClient.sql(PermissionSQL.COUNT_ALL_PERMISSION())
        .map(CommonMapper.CNT_MAPPER)
        .one();
  }
}
