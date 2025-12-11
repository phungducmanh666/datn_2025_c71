package services.product.api.controller;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.service.RoleService;
import services.product.core.model.database.PermissionData;
import services.product.core.model.database.RoleData;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {
  private final RoleService roleService;

  // #region crud
  @PostMapping
  public Mono<ResponseEntity<RoleData>> createRole(
      @RequestParam String name,
      @RequestParam(required = false) String description) {
    return roleService.createRole(name, description).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<RoleData>>> getRoles(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<RoleData> items = roleService.getRoles(page, size, sort, search);
    Mono<Long> total = roleService.countByFilter(search);

    return total.map(count -> {

      HttpHeaders headers = new HttpHeaders();
      headers.add("X-Total-Items", String.valueOf(count));
      if (page != null) {
        headers.add("X-Current-Page", String.valueOf(page));
      }
      if (size != null) {
        headers.add("X-Page-Size", String.valueOf(size));
      }

      return ResponseEntity.ok()
          .headers(headers)
          .body(items);

    });
  }

  @GetMapping("/{uuid}")
  public Mono<ResponseEntity<RoleData>> getRole(@PathVariable UUID uuid) {
    return roleService.getRole(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/name")
  public Mono<ResponseEntity<Long>> updateName(
      @PathVariable UUID uuid,
      @RequestParam(name = "name") String value) {
    return roleService.updateRoleName(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/description")
  public Mono<ResponseEntity<Long>> updateDescription(
      @PathVariable UUID uuid,
      @RequestParam(name = "description") String value) {
    return roleService.updateRoleDescription(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteRole(
      @PathVariable UUID uuid) {
    return roleService.deleteRole(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  // #region checking
  @GetMapping("/check-name")
  public Mono<ResponseEntity<Boolean>> checkNameExists(@RequestParam String name) {
    return roleService.existsByName(name).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  // #region permission
  @GetMapping(value = "/{uuid}/permissions", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<PermissionData>>> getPermissions(@PathVariable UUID uuid) {
    return Mono.just(ResponseEntity.ok()
        .body(roleService.getPermissions(uuid)));

  }

  @PostMapping(value = "/{uuid}/permissions")
  public Mono<ResponseEntity<Void>> assignPermission(
      @PathVariable UUID uuid,
      @RequestParam(name = "permission-uuid") UUID permissionUUID) {
    return roleService.assignPermission(uuid, permissionUUID).map(v -> ResponseEntity.noContent().build());
  }

  @DeleteMapping(value = "/{uuid}/permissions/{permissionUUID}")
  public Mono<ResponseEntity<Void>> removePermission(
      @PathVariable UUID uuid,
      @PathVariable UUID permissionUUID) {
    return roleService.removePermission(uuid, permissionUUID).map(v -> ResponseEntity.noContent().build());
  }
  // #endregion

  @GetMapping("/count-statistics")
  public Mono<ResponseEntity<Long>> countStatistics() {
    return roleService.countAllRole().map(rs -> ResponseEntity.ok().body(rs));
  }
}
