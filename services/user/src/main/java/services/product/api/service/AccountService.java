package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.AccountRepo;
import services.product.core.model.database.AccountData;
import services.product.core.model.database.RoleData;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepo accountRepo;

    // #region crud

    public Mono<AccountData> getAccount(String username) {
        return accountRepo.getAccount(username);
    }

    public Flux<RoleData> getRoles(String username) {
        return accountRepo.getRoles(username);
    }

    public Mono<Void> assignRole(String username, UUID roleUUID) {
        return accountRepo.assignRole(username, roleUUID);
    }

    public Mono<Void> removeRole(String username, UUID roleUUID) {
        return accountRepo.removeRole(username, roleUUID);
    }
    // #endregion
}
