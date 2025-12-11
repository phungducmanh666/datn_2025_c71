package services.product.api.controller;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.service.PermissionService;
import services.product.core.model.database.PermissionData;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {
  private final PermissionService permissionService;

  // #region
  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<PermissionData>>> getPermissions(
      @RequestParam(required = false) String sort) {
    return Mono.just(
        ResponseEntity.ok().body(permissionService.getPermissions(sort)));
  }

  @PostMapping
  public Mono<ResponseEntity<PermissionData>> createPermission(
      @RequestParam String name,
      @RequestParam(required = false) String description) {
    return permissionService.createPermission(name, description).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  @GetMapping("/check-name")
  public Mono<ResponseEntity<Boolean>> checkNameExists(@RequestParam String name) {
    return permissionService.existsByName(name).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deletePermission(
      @PathVariable UUID uuid) {
    return permissionService.deletePermission(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping("/count-statistics")
  public Mono<ResponseEntity<Long>> countStatistics() {
    return permissionService.countAllPermission().map(rs -> ResponseEntity.ok().body(rs));
  }

}
