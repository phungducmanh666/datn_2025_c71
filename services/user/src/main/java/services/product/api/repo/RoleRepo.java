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
import services.product.api.mapper.RoleRowMapper;
import services.product.core.model.database.PermissionData;
import services.product.core.model.database.RoleData;
import services.product.core.sql.RoleSQL;

@Repository
@RequiredArgsConstructor
public class RoleRepo {
  private final DatabaseClient databaseClient;

  // #region CRUD
  public Mono<RoleData> createRole(String name, String description) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(RoleSQL.CREATE_ROLE(name, description, params))
        .bindValues(params)
        .map(RoleRowMapper.MAP)
        .one();
  }

  public Mono<RoleData> getRole(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(RoleSQL.SELECT_BY_UUID(uuid, params))
        .bindValues(params)
        .map(RoleRowMapper.MAP)
        .one();
  }

  public Mono<RoleData> getRole(String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(RoleSQL.SELECT_BY_NAME(name, params))
        .bindValues(params)
        .map(RoleRowMapper.MAP)
        .one();
  }

  public Flux<RoleData> getRoles(Integer page, Integer size, String sort, String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.SELECT_BY_FILTER(page, size, sort, search, params))
        .bindValues(params)
        .map(RoleRowMapper.MAP)
        .all();
  }

  public Mono<Long> updateRoleName(UUID uuid, String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.UPDATE_ROLE_NAME(uuid, name, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updateRoleDescription(UUID uuid, String description) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.UPDATE_ROLE_DESCRIPTION(uuid, description, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> deleteRole(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.DELETE_BY_UUID(uuid, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }
  // #endregion

  // #region checking
  public Mono<Long> countByFilter(String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.COUNT_BY_FILTER(search, params))
        .bindValues(params)
        .map(CommonMapper.CNT_MAPPER)
        .one();
  }

  public Mono<Boolean> existsByName(String name) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.CHECK_NAME_EXISTS(name, params))
        .bindValues(params)
        .map(CommonMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }
  // #endregion

  // #region permission
  public Flux<PermissionData> getPermissions(UUID roleUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.SELECT_ALL_PERMISSION(roleUUID, params))
        .bindValues(params)
        .map(PermissionRowMapper.MAP)
        .all();
  }

  public Mono<Void> assignPermission(UUID roleUUID, UUID permissionUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.ASSIGN_PERMISSION(roleUUID, permissionUUID, params))
        .bindValues(params)
        .then();
  }

  public Mono<Void> removePermission(UUID roleUUID, UUID permissionUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.REMOVE_PERMISSION(roleUUID, permissionUUID, params))
        .bindValues(params)
        .then();
  }

  public Mono<Boolean> isPermissionAssigned(UUID roleUUID, UUID permissionUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(RoleSQL.CHECK_PERMISSION_ASSIGNED(roleUUID, permissionUUID, params))
        .bindValues(params)
        .map(CommonMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }
  // #endregion

  public Mono<Long> countAllRole() {
    return databaseClient.sql(RoleSQL.COUNT_ALL_ROLE())
        .map(CommonMapper.CNT_MAPPER)
        .one();
  }

}
