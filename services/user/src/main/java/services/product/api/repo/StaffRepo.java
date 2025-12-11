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
import services.product.api.mapper.StaffRowMapper;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.AccountData;
import services.product.core.model.database.StaffData;
import services.product.core.sql.StaffSQL;

@Repository
@RequiredArgsConstructor
public class StaffRepo {
  private final DatabaseClient databaseClient;
  private final TransactionalOperator txOperator;

  // Getter for DatabaseClient to allow external access
  public DatabaseClient getDatabaseClient() {
    return databaseClient;
  }

  // #region init
  public Mono<Void> initSequence() {
    return databaseClient.sql(StaffSQL.CREATE_STAFF_SEQUENCE()).then();
  }
  // #endregion

  // #region create

  public Mono<Void> createAdmin(
      String firstName,
      String lastName,
      LocalDateTime birthDate,
      EUserGender gender,
      String phoneNumber,
      String email) {

    // Sử dụng txOperator.transactional để đảm bảo toàn bộ luồng là một giao dịch
    return txOperator.transactional(
        // 1. Kiểm tra xem user "ADMIN" đã tồn tại chưa (Code ADMIN đặc biệt, không dùng
        // sequence)
        checkCodeExists("ADMIN")
            // 2. Chuyển kết quả kiểm tra (Boolean) thành Mono<Void>
            .flatMap(isExists -> {
              if (isExists) {
                // Nếu đã tồn tại (isExists == true), trả về Mono<Void> rỗng (hoàn thành)
                return Mono.empty();
              } else {
                // Nếu chưa tồn tại, bắt buộc phải dùng logic riêng vì Sequence sinh ra NVxxxxx
                // Tuy nhiên, nếu ADMIN cần code đặc biệt thì phải chèn thủ công.
                // Nhưng ở đây ta đang sửa StaffSQL.CREATE_STAFF dùng sequence.
                // VẬY ADMIN LÀM SAO?
                // -> Tạm thời ADMIN cũng sẽ dùng sequence (NVxxxxx) hoặc phải có method riêng.
                // Để đơn giản và đúng logic hệ thống, Admin cũng là NV.
                // Hoặc nếu muốn giữ code 'ADMIN', ta cần method SQL riêng.
                // Nhưng ở Initializer, rootUsername đang là 'NV00001' hoặc tương tự?
                // User đang dùng 'ROOT_USERNAME' từ env.

                // Giải pháp: createStaffRow hiện tại đã hardcode dùng sequence.
                // NẾU muốn code custom (như 'ADMIN'), ta cần method khác hoặc điều chỉnh SQL.
                // Tuy nhiên, sequence là cho NV thường.
                // Hãy để Admin cũng dùng sequence cho đồng bộ, hoặc bỏ qua Admin ở bước này nếu
                // user chưa yêu cầu.
                // Nhưng wait, createStaffRow đang được gọi.
                // Ta sẽ update createStaffRow bỏ tham số code.
                return createStaffRow(firstName, lastName, birthDate, gender, phoneNumber, email)
                    .flatMap(staff -> createStaffAccount(staff.getUuid(), staff.getCode()))
                    .then();
              }
            }))
        .then();
  }

  public Mono<StaffData> createStaff(
      String firstName,
      String lastName,
      LocalDateTime birthDate,
      EUserGender gender,
      String phoneNumber,
      String email) {
    return txOperator.transactional(
        createStaffRow(firstName, lastName, birthDate, gender, phoneNumber, email)
            .flatMap(staff -> createStaffAccount(staff.getUuid(), staff.getCode())
                .thenReturn(staff)));
  }

  public Mono<StaffData> createStaffRow(
      String firstName,
      String lastName,
      LocalDateTime birthDate,
      EUserGender gender,
      String phoneNumber,
      String email) {
    Map<String, Object> params = new HashMap<>();
    String sql = StaffSQL.CREATE_STAFF(firstName, lastName, birthDate, gender, phoneNumber, email, params);

    return databaseClient.sql(sql)
        .bindValues(params)
        .map(StaffRowMapper.MAP)
        .one();
  }

  private Mono<AccountData> createStaffAccount(
      UUID uuid,
      String code) {
    Map<String, Object> params = new HashMap<>();
    String sql = StaffSQL.CREATE_ACCOUNT(uuid, code, params);

    return databaseClient.sql(sql)
        .bindValues(params)
        .map(AccountRowMapper.MAP)
        .one();
  }

  // #endregion

  public Mono<StaffData> getStaff(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(StaffSQL.SELECT_STAFF_BY_UUID(uuid, params))
        .bindValues(params)
        .map(StaffRowMapper.MAP)
        .one();
  }

  public Mono<StaffData> getStaffByCode(String code) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient
        .sql(StaffSQL.SELECT_STAFF_BY_CODE(code, params))
        .bindValues(params)
        .map(StaffRowMapper.MAP)
        .one();
  }

  public Flux<StaffData> getStaffs(Integer page, Integer size, String sort, String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(StaffSQL.SELECT_BY_FILTER(page, size, sort, search, params))
        .bindValues(params)
        .map(StaffRowMapper.MAP)
        .all();
  }

  public Mono<Long> countByFilter(String search) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(StaffSQL.COUNT_BY_FILTER(search, params))
        .bindValues(params)
        .map(CommonMapper.CNT_MAPPER)
        .one();
  }

  public Mono<Long> deleteStaff(UUID uuid) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(StaffSQL.DELETE_BY_UUID(uuid, params))
        .bindValues(params)
        .fetch()
        .rowsUpdated();
  }

  public Mono<Long> countAllStaff() {
    return databaseClient.sql(StaffSQL.COUNT_ALL_STAFF())
        .map(CommonMapper.CNT_MAPPER)
        .one();
  }

  public Mono<Boolean> checkCodeExists(String code) {
    Map<String, Object> params = new HashMap<>();
    return databaseClient.sql(StaffSQL.CHECK_CODE_EXISTS(code, params))
        .bindValues(params)
        .map(CommonMapper.EXISTS_MAPPER)
        .one()
        .defaultIfEmpty(false);
  }

}
