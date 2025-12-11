package services.product.api.controller;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
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
import services.product.api.service.StaffService;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.AccountData;
import services.product.core.model.database.StaffData;

@RestController
@RequestMapping("/staffs")
@RequiredArgsConstructor
public class StaffController {
  private final StaffService staffService;

  // #region crud
  @PostMapping
  public Mono<ResponseEntity<StaffData>> createStaff(
      @RequestParam(name = "first-name") String firstName,
      @RequestParam(name = "last-name") String lastName,
      @RequestParam(required = false) EUserGender gender,
      @RequestParam(name = "birth-date") LocalDateTime birthDate,
      @RequestParam(name = "phone-number") String phoneNumber,
      @RequestParam String email) {
    return staffService.createStaff(firstName, lastName, gender, birthDate, phoneNumber, email)
        .map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<StaffData>>> getRoles(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<StaffData> items = staffService.getStaffs(page, size, sort, search);
    Mono<Long> total = staffService.countByFilter(search);

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
  public Mono<ResponseEntity<StaffData>> getRole(@PathVariable UUID uuid) {
    return staffService.getStaff(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping("/{code}/account")
  public Mono<ResponseEntity<AccountData>> getStaffAccount(@PathVariable String code) {
    return staffService.getStaffAccountByCode(code).map(rs -> ResponseEntity.ok().body(rs));
  }

  // @PatchMapping("/{uuid}/name")
  // public Mono<ResponseEntity<Long>> updateName(
  // @PathVariable UUID uuid,
  // @RequestParam(name = "name") String value) {
  // return staffService.updateRoleName(uuid, value).map(rs ->
  // ResponseEntity.ok().body(rs));
  // }

  // @PatchMapping("/{uuid}/description")
  // public Mono<ResponseEntity<Long>> updateDescription(
  // @PathVariable UUID uuid,
  // @RequestParam(name = "description") String value) {
  // return staffService.updateRoleDescription(uuid, value).map(rs ->
  // ResponseEntity.ok().body(rs));
  // }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteStaff(
      @PathVariable UUID uuid) {
    return staffService.deleteStaff(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }
  // // #endregion

  // // #region checking
  // @GetMapping("/check-name")
  // public Mono<ResponseEntity<Boolean>> checkNameExists(@RequestParam String
  // name) {
  // return staffService.existsByName(name).map(rs ->
  // ResponseEntity.ok().body(rs));
  // }
  // // #endregion

  // // #region permission
  // @GetMapping(value = "/{uuid}/permissions", produces =
  // MediaType.APPLICATION_NDJSON_VALUE)
  // public Mono<ResponseEntity<Flux<PermissionData>>>
  // getPermissions(@PathVariable UUID uuid) {
  // return Mono.just(ResponseEntity.ok()
  // .body(staffService.getPermissions(uuid)));

  // }

  // @PostMapping(value = "/{uuid}/permissions")
  // public Mono<ResponseEntity<Void>> assignPermission(
  // @PathVariable UUID uuid,
  // @RequestParam(name = "permission-uuid") UUID permissionUUID) {
  // return staffService.assignPermission(uuid, permissionUUID).map(v ->
  // ResponseEntity.noContent().build());
  // }

  // @DeleteMapping(value = "/{uuid}/permissions/{permissionUUID}")
  // public Mono<ResponseEntity<Void>> removePermission(
  // @PathVariable UUID uuid,
  // @PathVariable UUID permissionUUID) {
  // return staffService.removePermission(uuid, permissionUUID).map(v ->
  // ResponseEntity.noContent().build());
  // }
  // #endregion

  @GetMapping("/count-statistics")
  public Mono<ResponseEntity<Long>> countStatistics() {
    return staffService.countAllStaff().map(rs -> ResponseEntity.ok().body(rs));
  }

}
