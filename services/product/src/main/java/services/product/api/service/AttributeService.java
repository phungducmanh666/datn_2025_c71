package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.AttributeRepo;
import services.product.core.model.database.AttributeData;

@Service
@RequiredArgsConstructor
public class AttributeService {
    private final AttributeRepo attributeRepo;

    // #region crud
    public Mono<AttributeData> create(UUID groupUUID, String name) {
        return attributeRepo.create(groupUUID, name);
    }

    public Mono<AttributeData> getByUUID(UUID uuid) {
        return attributeRepo.getByUUID(uuid);
    }

    public Flux<AttributeData> getByFilter(UUID groupUUID, Integer page, Integer size, String sort, String search) {
        return attributeRepo.getByFilter(groupUUID, page, size, sort, search);
    }

    public Mono<Long> updateNameByUUID(UUID uuid, String name) {
        return attributeRepo.updateNameByUUID(uuid, name);
    }

    public Mono<Long> deleteByUUID(UUID uuid) {
        return attributeRepo.deleteByUUID(uuid);
    }
    // #endregion

    // #region checking
    public Mono<Boolean> existsByName(UUID groupUUID, String name) {
        return attributeRepo.existsByName(groupUUID, name);
    }

    public Mono<Long> countByFilter(UUID groupUUID, String search) {
        return attributeRepo.countByFilter(groupUUID, search);
    }
    // #endregion

}
