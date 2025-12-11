package services.product.api.repo;

import java.time.LocalDateTime;
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
import services.product.api.mapper.CommonMapper;
import services.product.api.mapper.CustomerRowMapper;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.AccountData;
import services.product.core.model.database.CustomerData;
import services.product.core.sql.CustomerSQL;

@Repository
@RequiredArgsConstructor
public class CustomerRepo {
  private final DatabaseClient databaseClient;
  private final TransactionalOperator txOperator;

  // #region create
  public Mono<CustomerData> createCustomer(
      String firstName,
      String lastName,
      LocalDateTime birthDate,
      EUserGender gender,
      String phoneNumber,
      String email,
      String password,
      String photoUrl) {
    return txOperator.transactional(
        createCustomerRow(firstName, lastName, birthDate, gender, phoneNumber, email, photoUrl)
            .flatMap(customer -> createCustomerAccount(customer.getUuid(), customer.getEmail(), password)
                .thenReturn(customer)));
  }

  private Mono<CustomerData> createCustomerRow(
      String firstName,
      String lastName,
      LocalDateTime birthDate,
      EUserGender gender,
      String phoneNumber,
      String email,
      String photoUrl) {
    Map<String, Object> params = new HashMap<>();
    String sql = CustomerSQL.CREATE_CUSTOMER(firstName, lastName, birthDate, gender, phoneNumber, email, photoUrl,
        params);

    return databaseClient.sql(sql)
        .bindValues(params)
        .map(CustomerRowMapper.MAP)
        .one();
  }

  private Mono<AccountData> createCustomerAccount(
      UUID uuid,
      String email,
      String password) {
    Map<String, Object> params = new HashMap<>();
    String sql = CustomerSQL.CREATE_ACCOUNT(uuid, email, password, params);

    return databaseClient.sql(sql)
        .bindValues(params)
        .map(AccountRowMapper.MAP)
        .one();
  }

  // #endregion

  public Mono<CustomerData> getCustomer(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(CustomerSQL.SELECT_CUSTOMER_BY_UUID(uuid, params))
        .bindValues(params)
        .map(CustomerRowMapper.MAP)
        .one();
  }

  public Mono<CustomerData> getCustomer(String email) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(CustomerSQL.SELECT_CUSTOMER_BY_EMAIL(email, params))
        .bindValues(params)
        .map(CustomerRowMapper.MAP)
        .one();
  }

  public Flux<CustomerData> getCustomers(Integer page, Integer size, String sort, String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.SELECT_BY_FILTER(page, size, sort, search, params))
        .bindValues(params)
        .map(CustomerRowMapper.MAP)
        .all();
  }

  public Mono<Long> countByFilter(String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.COUNT_BY_FILTER(search, params))
        .bindValues(params)
        .map(CommonMapper.CNT_MAPPER)
        .one();
  }

  public Mono<Long> deleteCustomer(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.DELETE_BY_UUID(uuid, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Boolean> existsByEmail(String email) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.CHECK_EMAIL_EXISTS(email, params))
        .bindValues(params)
        .map(CommonMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }

  // #region statistics
  public Mono<Long> countAllCustomer() {
    return databaseClient.sql(CustomerSQL.COUNT_ALL_CUSTOMER())
        .map(CommonMapper.CNT_MAPPER)
        .one();
  }
  // #endregion

  public Mono<Long> updateFirstName(UUID uuid, String firstName) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.UPDATE_FIRST_NAME(uuid, firstName, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updateLastName(UUID uuid, String lastName) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.UPDATE_LAST_NAME(uuid, lastName, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updateGender(UUID uuid, EUserGender gender) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.UPDATE_GENDER(uuid, gender, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updateBirthDate(UUID uuid, LocalDateTime birthDate) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.UPDATE_BIRTH_DATE(uuid, birthDate, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updatePhoneNumber(UUID uuid, String phoneNumber) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.UPDATE_PHONE_NUMBER(uuid, phoneNumber, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updateAddress(UUID uuid, String address) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.UPDATE_ADDRESS(uuid, address, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> updatePhotoUrl(UUID uuid, String photoUrl) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(CustomerSQL.UPDATE_PHOTO_URL(uuid, photoUrl, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

}
