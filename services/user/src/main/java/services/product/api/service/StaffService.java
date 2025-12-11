package services.product.api.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.AccountRepo;
import services.product.api.repo.StaffRepo;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.AccountData;
import services.product.core.model.database.StaffData;

@Service
@RequiredArgsConstructor
public class StaffService {
    private final StaffRepo staffRepo;
    private final AccountRepo accountRepo;

    // #region crud
    public Mono<StaffData> createStaff(
            String firstName,
            String lastName,
            EUserGender gender,
            LocalDateTime birthDate,
            String phoneNumber,
            String email) {
        return staffRepo.createStaff(firstName, lastName, birthDate, gender, phoneNumber, email);
    }

    public Mono<StaffData> getStaff(UUID uuid) {
        return staffRepo.getStaff(uuid);
    }

    public Mono<AccountData> getStaffAccountByCode(String code) {
        return staffRepo.getStaffByCode(code)
                .flatMap(staff -> accountRepo.getAccountByStaffUUID(staff.getUuid()));
    }

    public Flux<StaffData> getStaffs(Integer page, Integer size, String sort,
            String search) {
        return staffRepo.getStaffs(page, size, sort, search);
    }

    // public Mono<Long> updateRoleName(UUID uuid, String value) {
    // return staffRepo.updateRoleName(uuid, value);
    // }

    // public Mono<Long> updateRoleDescription(UUID uuid, String value) {
    // return staffRepo.updateRoleDescription(uuid, value);
    // }

    public Mono<Long> deleteStaff(UUID uuid) {
        return staffRepo.deleteStaff(uuid);
    }
    // // #endregion

    // // #region checking
    // public Mono<Boolean> existsByName(String name) {
    // return staffRepo.existsByName(name);
    // }

    public Mono<Long> countByFilter(String search) {
        return staffRepo.countByFilter(search);
    }
    // // #endregion

    // // #region permission
    // public Flux<PermissionData> getPermissions(UUID roleUUID) {
    // return staffRepo.getPermissions(roleUUID);
    // }

    // public Mono<Void> assignPermission(UUID roleUUID, UUID permissionUUID) {
    // return staffRepo.assignPermission(roleUUID, permissionUUID);
    // }

    // public Mono<Void> removePermission(UUID roleUUID, UUID permissionUUID) {
    // return staffRepo.removePermission(roleUUID, permissionUUID);
    // }
    // #endregion

    public Mono<Long> countAllStaff() {
        return staffRepo.countAllStaff();
    }
}
