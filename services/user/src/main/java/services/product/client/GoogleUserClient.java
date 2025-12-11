package services.product.client;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;
import services.product.core.model.google.GoogleUserInfo;

@Service
public class GoogleUserClient {

  private final String BASE_URL = "https://www.googleapis.com/oauth2/v3";
  private final WebClient webClient;

  public GoogleUserClient() {
    this.webClient = WebClient.builder().baseUrl(BASE_URL).build();
  }

  public Mono<GoogleUserInfo> getUserInfo(String accessToken) {
    return webClient.get()
        .uri("/userinfo")
        .header("Authorization", "Bearer " + accessToken)
        .retrieve()
        .onStatus(status -> status.is4xxClientError(),
            clientResponse -> Mono
                .error(new RuntimeException("Lỗi trao đổi code với Google: " + clientResponse.statusCode())))
        .bodyToMono(GoogleUserInfo.class);
  }

}
