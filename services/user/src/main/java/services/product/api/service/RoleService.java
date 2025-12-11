package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.RoleRepo;
import services.product.core.model.database.PermissionData;
import services.product.core.model.database.RoleData;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepo roleRepo;

    // #region crud
    public Mono<RoleData> createRole(String name, String description) {
        return roleRepo.createRole(name, description);
    }

    public Mono<RoleData> getRole(UUID uuid) {
        return roleRepo.getRole(uuid);
    }

    public Flux<RoleData> getRoles(Integer page, Integer size, String sort, String search) {
        return roleRepo.getRoles(page, size, sort, search);
    }

    public Mono<Long> updateRoleName(UUID uuid, String value) {
        return roleRepo.updateRoleName(uuid, value);
    }

    public Mono<Long> updateRoleDescription(UUID uuid, String value) {
        return roleRepo.updateRoleDescription(uuid, value);
    }

    public Mono<Long> deleteRole(UUID uuid) {
        return roleRepo.deleteRole(uuid);
    }
    // #endregion

    // #region checking
    public Mono<Boolean> existsByName(String name) {
        return roleRepo.existsByName(name);
    }

    public Mono<Long> countByFilter(String search) {
        return roleRepo.countByFilter(search);
    }
    // #endregion

    // #region permission
    public Flux<PermissionData> getPermissions(UUID roleUUID) {
        return roleRepo.getPermissions(roleUUID);
    }

    public Mono<Void> assignPermission(UUID roleUUID, UUID permissionUUID) {
        return roleRepo.assignPermission(roleUUID, permissionUUID);
    }

    public Mono<Void> removePermission(UUID roleUUID, UUID permissionUUID) {
        return roleRepo.removePermission(roleUUID, permissionUUID);
    }
    // #endregion

    public Mono<Long> countAllRole() {
        return roleRepo.countAllRole();
    }
}
