package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.PermissionRepo;
import services.product.core.model.database.PermissionData;

@Service
@RequiredArgsConstructor
public class PermissionService {
  private final PermissionRepo permissionRepo;

  public Mono<PermissionData> createPermission(String name, String description) {
    return permissionRepo.createPermission(name, description);
  }

  public Flux<PermissionData> getPermissions(String sort) {
    return permissionRepo.getPermissions(sort);
  }

  public Mono<Boolean> existsByName(String name) {
    return permissionRepo.existsByName(name);
  }

  public Mono<Long> deletePermission(UUID uuid) {
    return permissionRepo.deletePermission(uuid);
  }

  public Mono<Long> countAllPermission() {
    return permissionRepo.countAllPermission();
  }

}
