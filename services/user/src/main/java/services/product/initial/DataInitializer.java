package services.product.initial;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.AccountRepo;
import services.product.api.repo.PermissionRepo;
import services.product.api.repo.RoleRepo;
import services.product.api.repo.StaffRepo;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.PermissionData;
import services.product.core.model.database.RoleData;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

  private final StaffRepo staffRepo;
  private final RoleRepo roleRepo;
  private final AccountRepo accountRepo;
  private final PermissionRepo permissionRepo;

  // Tên Role mặc định
  private static final String DEFAULT_ROLE_NAME = "ALL";

  @Bean
  public CommandLineRunner initData() {
    return args -> {
      // 0. Khởi tạo Sequence nếu chưa có
      staffRepo.initSequence().block();

      try {
        // ===== PHẦN 1: KHỞI TẠO PERMISSIONS TỪ BIẾN MÔI TRƯỜNG =====
        System.out.println("========================================");
        System.out.println("Bắt đầu khởi tạo Permissions từ biến môi trường...");
        System.out.println("========================================");

        // 1. Đọc biến môi trường PERMISSIONS
        String permissionsEnv = System.getenv("PERMISSIONS");

        if (permissionsEnv == null || permissionsEnv.trim().isEmpty()) {
          System.out.println("⚠ Không tìm thấy biến môi trường PERMISSIONS hoặc biến rỗng.");
          System.out.println("Bỏ qua khởi tạo permissions từ môi trường.");
        } else {
          System.out.println("✓ Đã đọc biến môi trường PERMISSIONS: " + permissionsEnv);

          // 2. Parse thành array (split by comma)
          String[] permissionNames = permissionsEnv.split(",");
          System.out.println("✓ Số lượng permissions cần xử lý: " + permissionNames.length);

          // 3. Khởi tạo hoặc lấy các permissions
          List<Mono<PermissionData>> permissionMonos = new ArrayList<>();

          for (String permName : permissionNames) {
            String trimmedName = permName.trim();
            if (!trimmedName.isEmpty()) {
              Mono<PermissionData> permMono = permissionRepo.existsByName(trimmedName)
                  .flatMap(exists -> {
                    if (Boolean.FALSE.equals(exists)) {
                      System.out.println("  → Tạo mới permission: " + trimmedName);
                      return permissionRepo.createPermission(trimmedName, "Auto-created from environment variable");
                    } else {
                      System.out.println("  → Permission đã tồn tại: " + trimmedName);
                      return permissionRepo.getPermissionByName(trimmedName);
                    }
                  })
                  .doOnError(
                      e -> System.err.println("  ✗ Lỗi khi xử lý permission '" + trimmedName + "': " + e.getMessage()));

              permissionMonos.add(permMono);
            }
          }

          // 4. Đợi tất cả permissions được tạo/lấy
          Flux<PermissionData> permissionsFlux = Flux.concat(permissionMonos);

          // 5. Đảm bảo role "ALL" tồn tại
          System.out.println("\n▶ Kiểm tra role '" + DEFAULT_ROLE_NAME + "'...");
          Mono<RoleData> roleAllMono = roleRepo.existsByName(DEFAULT_ROLE_NAME)
              .flatMap(exists -> {
                if (Boolean.FALSE.equals(exists)) {
                  System.out.println("  → Tạo mới role: " + DEFAULT_ROLE_NAME);
                  return roleRepo.createRole(DEFAULT_ROLE_NAME, "Super admin role with all permissions");
                } else {
                  System.out.println("  → Role đã tồn tại: " + DEFAULT_ROLE_NAME);
                  return roleRepo.getRole(DEFAULT_ROLE_NAME);
                }
              })
              .doOnSuccess(role -> System.out
                  .println("✓ Role '" + DEFAULT_ROLE_NAME + "' sẵn sàng (UUID: " + role.getUuid() + ")"));

          // 6. Gán tất cả permissions cho role ALL
          System.out.println("\n▶ Bắt đầu gán permissions cho role '" + DEFAULT_ROLE_NAME + "'...");
          Mono<Void> assignmentFlow = roleAllMono
              .flatMapMany(role -> permissionsFlux
                  .flatMap(permission -> roleRepo.isPermissionAssigned(role.getUuid(), permission.getUuid())
                      .flatMap(assigned -> {
                        if (Boolean.FALSE.equals(assigned)) {
                          System.out.println(
                              "  → Gán permission '" + permission.getName() + "' cho role '" + DEFAULT_ROLE_NAME + "'");
                          return roleRepo.assignPermission(role.getUuid(), permission.getUuid());
                        } else {
                          System.out.println("  → Permission '" + permission.getName() + "' đã được gán cho role '"
                              + DEFAULT_ROLE_NAME + "'");
                          return Mono.empty();
                        }
                      })))
              .then()
              .doOnSuccess(v -> {
                System.out.println("\n========================================");
                System.out.println("✓ Hoàn tất khởi tạo Permissions và Role");
                System.out.println("========================================\n");
              })
              .doOnError(e -> System.err.println("✗ Lỗi trong quá trình khởi tạo permissions: " + e.getMessage()));

          // 7. Block để đợi hoàn tất
          assignmentFlow.block();
        }

        // ===== PHẦN 2: KHỞI TẠO ROOT ACCOUNT TỪ BIẾN MÔI TRƯỜNG =====
        System.out.println("========================================");
        System.out.println("Bắt đầu khởi tạo Root Account từ biến môi trường...");
        System.out.println("========================================");

        // 1. Đọc biến môi trường ROOT_USERNAME và ROOT_PASSWORD
        String rootUsername = System.getenv("ROOT_USERNAME");
        String rootPassword = System.getenv("ROOT_PASSWORD");

        if (rootUsername == null || rootUsername.trim().isEmpty()) {
          System.out.println("⚠ Không tìm thấy biến môi trường ROOT_USERNAME hoặc biến rỗng.");
          System.out.println("Bỏ qua khởi tạo root account từ môi trường.");
        } else if (rootPassword == null || rootPassword.trim().isEmpty()) {
          System.out.println("⚠ Không tìm thấy biến môi trường ROOT_PASSWORD hoặc biến rỗng.");
          System.out.println("Bỏ qua khởi tạo root account từ môi trường.");
        } else {
          System.out.println("✓ Đã đọc biến môi trường ROOT_USERNAME: " + rootUsername);
          System.out.println("✓ Đã đọc biến môi trường ROOT_PASSWORD: [HIDDEN]");

          // 2. Logic khởi tạo/cập nhật root account
          Mono<Void> rootAccountFlow = accountRepo.getAccount(rootUsername)
              .flatMap(existingAccount -> {
                // Account đã tồn tại - kiểm tra password
                System.out.println("  → Account '" + rootUsername + "' đã tồn tại. Đang kiểm tra password...");

                boolean passwordMatches = services.product.helper.PasswordEncoder.compare(rootPassword,
                    existingAccount.getPassword());

                if (passwordMatches) {
                  System.out.println("  ✓ Password khớp. Không cần cập nhật.");
                  return Mono.just(existingAccount);
                } else {
                  System.out.println("  → Password không khớp. Đang cập nhật password...");
                  // Repository sẽ tự động mã hóa password
                  return accountRepo.updatePassword(rootUsername, rootPassword)
                      .doOnSuccess(v -> System.out.println("  ✓ Đã cập nhật password cho '" + rootUsername + "'"))
                      .thenReturn(existingAccount);
                }
              })
              .switchIfEmpty(Mono.defer(() -> {
                // Account chưa tồn tại - tạo mới
                System.out.println("  → Account '" + rootUsername + "' chưa tồn tại. Đang tạo mới...");

                return staffRepo.checkCodeExists(rootUsername)
                    .flatMap(codeExists -> {
                      if (Boolean.TRUE.equals(codeExists)) {
                        String msg = "  ✗ Lỗi: Code '" + rootUsername
                            + "' đã được sử dụng bởi staff khác nhưng không có account.";
                        System.err.println(msg);
                        return Mono.error(new IllegalStateException(msg));
                      }

                      // Tạo staff row (Code sẽ được sequence sinh tự động)
                      return staffRepo.createStaffRow(
                          "Root", // firstName
                          "Admin", // lastName
                          LocalDateTime.now().minusYears(30), // birthDate
                          EUserGender.MALE, // gender
                          "0000000000", // phoneNumber
                          "root@system.local" // email
                      )
                          .flatMap(staff -> {
                            // Tạo account với password từ biến môi trường
                            Map<String, Object> params = new HashMap<>();
                            String encodedPassword = services.product.helper.PasswordEncoder.encode(rootPassword);
                            params.put("username", rootUsername);
                            params.put("password", encodedPassword);
                            params.put("status", services.product.core.eum.EAccountStatus.ACTIVE.name());
                            params.put("staff_uuid", staff.getUuid());

                            String sql = String.format(
                                """
                                    INSERT
                                    INTO %s (username, password, status, staff_uuid)
                                    OUTPUT inserted.username, inserted.password, inserted.status, inserted.staff_uuid, inserted.customer_uuid
                                    VALUES (:username, :password, :status, :staff_uuid)
                                    """,
                                services.product.core.constance.DBTableName.ACCOUNT);

                            return staffRepo.getDatabaseClient().sql(sql)
                                .bindValues(params)
                                .map(services.product.api.mapper.AccountRowMapper.MAP)
                                .one();
                          })
                          .doOnSuccess(account -> System.out
                              .println("  ✓ Đã tạo account mới '" + rootUsername + "'"));
                    });
              }))
              .then();

          // 3. Đảm bảo role ALL tồn tại và gán cho root account
          System.out.println("\n▶ Kiểm tra role '" + DEFAULT_ROLE_NAME + "' cho account '" + rootUsername + "'...");
          Mono<Void> assignRoleFlow = roleRepo.existsByName(DEFAULT_ROLE_NAME)
              .flatMap(exists -> {
                if (Boolean.FALSE.equals(exists)) {
                  System.out.println("  → Tạo mới role: " + DEFAULT_ROLE_NAME);
                  return roleRepo.createRole(DEFAULT_ROLE_NAME, "Super admin role with all permissions");
                } else {
                  System.out.println("  → Role đã tồn tại: " + DEFAULT_ROLE_NAME);
                  return roleRepo.getRole(DEFAULT_ROLE_NAME);
                }
              })
              .flatMap(role -> {
                // Kiểm tra xem role đã được gán chưa
                return accountRepo.getRoles(rootUsername)
                    .filter(r -> r.getUuid().equals(role.getUuid()))
                    .hasElements()
                    .flatMap(hasRole -> {
                      if (Boolean.TRUE.equals(hasRole)) {
                        System.out
                            .println("  ✓ Role '" + DEFAULT_ROLE_NAME + "' đã được gán cho '" + rootUsername + "'");
                        return Mono.empty();
                      } else {
                        System.out.println(
                            "  → Gán role '" + DEFAULT_ROLE_NAME + "' cho account '" + rootUsername + "'...");
                        return accountRepo.assignRole(rootUsername, role.getUuid())
                            .doOnSuccess(
                                v -> System.out.println("  ✓ Đã gán role '" + DEFAULT_ROLE_NAME + "' thành công"));
                      }
                    });
              })
              .then();

          // 4. Chạy toàn bộ flow
          Mono<Void> completeFlow = rootAccountFlow
              .then(assignRoleFlow)
              .doOnSuccess(v -> {
                System.out.println("\n========================================");
                System.out.println("✓ Hoàn tất khởi tạo Root Account");
                System.out.println("========================================\n");
              })
              .doOnError(e -> System.err.println("✗ Lỗi trong quá trình khởi tạo root account: " + e.getMessage()));

          // BLOCKING: Đợi hoàn tất
          completeFlow.block();
        }

      } catch (Exception e) {
        System.err.println("✗ Exception trong DataInitializer: " + e.getMessage());
        e.printStackTrace();
      }
    };
  }
}
