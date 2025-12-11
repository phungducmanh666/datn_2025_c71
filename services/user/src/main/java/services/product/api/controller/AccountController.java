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
import services.product.api.service.AccountService;
import services.product.core.model.database.AccountData;
import services.product.core.model.database.RoleData;

@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
public class AccountController {
  private final AccountService accountService;

  @GetMapping("/{username}")
  public Mono<ResponseEntity<AccountData>> getRole(@PathVariable String username) {
    return accountService.getAccount(username).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(value = "/{username}/roles", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<RoleData>>> getRoles(@PathVariable String username) {
    return Mono.just(ResponseEntity.ok()
        .body(accountService.getRoles(username)));

  }

  @PostMapping(value = "/{username}/roles")
  public Mono<ResponseEntity<Void>> assignRole(
      @PathVariable String username,
      @RequestParam(name = "role-uuid") UUID roleUUID) {
    return accountService.assignRole(username, roleUUID).map(v -> ResponseEntity.noContent().build());
  }

  @DeleteMapping(value = "/{username}/roles/{roleUUID}")
  public Mono<ResponseEntity<Void>> removeRole(
      @PathVariable String username,
      @PathVariable UUID roleUUID) {
    return accountService.removeRole(username, roleUUID).map(v -> ResponseEntity.noContent().build());
  }
}
