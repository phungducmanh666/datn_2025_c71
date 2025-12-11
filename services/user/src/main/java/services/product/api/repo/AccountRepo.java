package services.product.api.repo;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.reactive.TransactionalOperator;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.mapper.AccountRowMapper;
import services.product.api.mapper.RoleRowMapper;
import services.product.core.model.database.AccountData;
import services.product.core.model.database.RoleData;
import services.product.core.sql.AccountSQL;
import services.product.helper.PasswordEncoder;

@Repository
@RequiredArgsConstructor
public class AccountRepo {
  private final DatabaseClient databaseClient;
  private final TransactionalOperator txOperator;

  public Mono<AccountData> getAccount(String username) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(AccountSQL.SELECT_BY_USERNAME(username, params))
        .bindValues(params)
        .map(AccountRowMapper.MAP)
        .one();
  }

  public Mono<AccountData> getAccountByStaffUUID(UUID staffUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(AccountSQL.SELECT_BY_STAFF_UUID(staffUUID, params))
        .bindValues(params)
        .map(AccountRowMapper.MAP)
        .one();
  }

  public Mono<Void> updatePassword(String username, String rawPassword) {
    // Mã hóa password trước khi lưu vào database
    String encodedPassword = PasswordEncoder.encode(rawPassword);
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(AccountSQL.UPDATE_PASSWORD(username, encodedPassword, params))
        .bindValues(params)
        .then();
  }

  public Flux<RoleData> getRoles(String username) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(AccountSQL.SELECT_ALL_ROLE(username, params))
        .bindValues(params)
        .map(RoleRowMapper.MAP)
        .all();
  }

  public Mono<Void> assignRole(String username, UUID roleUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(AccountSQL.ASSIGN_ROLE(username, roleUUID, params))
        .bindValues(params)
        .then();
  }

  public Mono<Void> removeRole(String username, UUID roleUUID) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(AccountSQL.REMOVE_ROLE(username, roleUUID, params))
        .bindValues(params)
        .then();
  }

}
