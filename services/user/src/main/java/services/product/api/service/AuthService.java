package services.product.api.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import services.product.helper.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final AccountService accountService;

  public Mono<Boolean> login(String username, String password) {
    return accountService.getAccount(username)
        .flatMap(account -> {
          boolean matches = PasswordEncoder.compare(password, account.getPassword());
          return Mono.just(matches);
        })
        .defaultIfEmpty(false);
  }

}
