package services.product.client;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import reactor.core.publisher.Mono;
import services.product.core.model.google.GoogleTokenResponse;

@Service
public class GoogleAuthClient {

  private final String BASE_URL = "https://oauth2.googleapis.com";
  private final WebClient webClient;

  public GoogleAuthClient() {
    this.webClient = WebClient.builder().baseUrl(BASE_URL).build();
  }

  public Mono<GoogleTokenResponse> exchangeCodeForToken(MultiValueMap<String, String> formData) {
    return webClient.post()
        .uri("/token")
        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
        .bodyValue(formData)
        .retrieve()
        .onStatus(status -> status.is4xxClientError(),
            clientResponse -> Mono
                .error(new RuntimeException("Lỗi trao đổi code với Google: " + clientResponse.statusCode())))
        .bodyToMono(GoogleTokenResponse.class);
  }

}
