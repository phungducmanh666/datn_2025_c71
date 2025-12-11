package services.product.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.service.AccountService;
import services.product.api.service.AuthService;
import services.product.api.service.RoleService;
import services.product.core.eum.EAccountReferenceType;
import services.product.core.model.database.PermissionData;
import services.product.core.model.database.RoleData;
import services.product.core.model.request.LoginAccount;
import services.product.core.model.response.TokenParserData;
import services.product.core.util.JwtUtil;

@RestController
@RequestMapping("/auths")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final AccountService accountService;
  private final JwtUtil jwtUtil;
  private final RoleService roleService;

  @PostMapping("/token/generate")
  public Mono<ResponseEntity<String>> generateToken(@RequestBody LoginAccount account) {
    return authService.login(account.getUsername(), account.getPassword())
        .map(isSuccess -> {
          if (isSuccess) {
            String token = jwtUtil.generateToken(account.getUsername());
            return ResponseEntity.ok(token);
          } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Sai username hoặc password");
          }
        });
  }

  @PostMapping("/token/parser")
  public Mono<ResponseEntity<TokenParserData>> parserToken(
      @RequestParam String token) {

    System.out.println(String.format("""






        TOKEN: %s





        """, token));

    if (token == null || token.isBlank()) {
      return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null));
    }

    if (!jwtUtil.isTokenValid(token)) {
      return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null));
    }

    String username = jwtUtil.extractUsername(token);

    return accountService.getAccount(username)
        .flatMap(account -> {
          // Lấy roles một lần
          Flux<RoleData> rolesFlux = accountService.getRoles(username);

          // Danh sách tên role
          Mono<List<String>> rolesMono = rolesFlux
              .map(RoleData::getName)
              .collectList();

          // Danh sách permission không trùng
          Mono<List<String>> permissionsMono = rolesFlux
              .flatMap(role -> roleService.getPermissions(role.getUuid()))
              .map(PermissionData::getName)
              .distinct() // loại bỏ permission trùng
              .collectList();

          return Mono.zip(rolesMono, permissionsMono)
              .map(tuple -> {
                List<String> roles = tuple.getT1();
                List<String> permissions = tuple.getT2();
                EAccountReferenceType type = account.getStaffUUID() != null ? EAccountReferenceType.STAFF
                    : EAccountReferenceType.CUSTOMER;
                UUID userUUID = account.getStaffUUID() != null ? account.getStaffUUID() : account.getCustomerUUID();

                TokenParserData data = TokenParserData.builder()
                    .type(type)
                    .userUUID(userUUID)
                    .username(username)
                    .roles(roles)
                    .permissions(permissions)
                    .build();

                return ResponseEntity.ok(data);
              });
        })
        .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
  }

  // @PostMapping("/token/disable")
  // public Mono<TokenParserData> disableToken(ServerHttpRequest request) {
  // MultiValueMap<String, String> headers = request.getHeaders();
  // String token = headers.getFirst("X-TOKEN");
  // return null;
  // }

}
