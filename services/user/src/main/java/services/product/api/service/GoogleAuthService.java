package services.product.api.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import services.product.client.GoogleAuthClient;
import services.product.client.GoogleUserClient;
import services.product.core.config.GoogleAuthConfig;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.CustomerData;
import services.product.core.model.google.GoogleTokenResponse;
import services.product.core.model.google.GoogleUserInfo;
import services.product.core.util.JwtUtil;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

  private final GoogleAuthConfig config;
  private final GoogleAuthClient authClient;
  private final GoogleUserClient userClient;
  private final CustomerService customerService;
  private final JwtUtil jwtUtil;

  public Mono<String> generateLoginURL() {
    String state = UUID.randomUUID().toString();
    return Mono.just(UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
        .queryParam("client_id", config.getClientId())
        .queryParam("redirect_uri", config.getRedirectUri())
        .queryParam("response_type", "code")
        .queryParam("scope", "openid profile email")
        .queryParam("state", state)
        .build()
        .toUriString());
  }

  public Mono<String> loginBangGoogleCode(String code) {
    return exchangeCodeForToken(code).flatMap(response -> getTokeUserInfo(response.getAccessToken())).flatMap(
        user -> generateToken(user));
  }

  private Mono<String> generateToken(GoogleUserInfo user) {
    return isUserAccountExists(user.getEmail()).flatMap(
        isExists -> {
          if (isExists) {
            return getCustomer(user.getEmail());
          }
          return createCustomer(user);
        }).map(customer -> jwtUtil.generateToken(customer.getEmail()));
  }

  private Mono<Boolean> isUserAccountExists(String email) {
    return customerService.existsByEmail(email);
  }

  private Mono<CustomerData> getCustomer(String email) {
    return customerService.getCustomer(email);
  }

  private Mono<CustomerData> createCustomer(GoogleUserInfo user) {
    return customerService.createCustomer(
        user.getFamilyName(),
        user.getGivenName(),
        EUserGender.MALE,
        LocalDateTime.now(),
        "",
        user.getEmail(),
        user.getEmail(),
        user.getPicture());
  }

  public Mono<GoogleTokenResponse> exchangeCodeForToken(String code) {
    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    body.add("code", code);
    body.add("client_id", config.getClientId());
    body.add("client_secret", config.getClientSecret());
    body.add("redirect_uri", config.getRedirectUri());
    body.add("grant_type", "authorization_code");
    return authClient.exchangeCodeForToken(body);
  }

  public Mono<GoogleUserInfo> getTokeUserInfo(String token) {
    return userClient.getUserInfo(token);
  }

}
