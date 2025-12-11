package services.product.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import services.product.api.service.GoogleAuthService;

@RestController
@RequestMapping("/google/auth")
@RequiredArgsConstructor
public class GoogleAuthController {

  private final GoogleAuthService googleAuthService;

  @GetMapping("/login")
  public Mono<ResponseEntity<String>> redirectToGoogle() {
    return googleAuthService.generateLoginURL().map(url -> ResponseEntity.ok().body(url));
  }

  @GetMapping("/exchange-code-for-token")
  public Mono<String> getToken(
      @RequestParam("code") String code,
      @RequestParam("state") String state) {
    return googleAuthService.loginBangGoogleCode(code);
  }
}
