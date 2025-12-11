package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.AttributeGroupRepo;
import services.product.core.model.database.AttributeGroupData;

@Service
@RequiredArgsConstructor
public class AttributeGroupService {
    private final AttributeGroupRepo attributeGroupRepo;

    // #region crud
    public Mono<AttributeGroupData> create(String name) {
        return attributeGroupRepo.create(name);
    }

    public Mono<AttributeGroupData> getByUUID(UUID uuid) {
        return attributeGroupRepo.getByUUID(uuid);
    }

    public Flux<AttributeGroupData> getByFilter(Integer page, Integer size, String sort, String search) {
        return attributeGroupRepo.getByFilter(page, size, sort, search);
    }

    public Mono<Long> updateNameByUUID(UUID uuid, String name) {
        return attributeGroupRepo.updateNameByUUID(uuid, name);
    }

    public Mono<Long> deleteByUUID(UUID uuid) {
        return attributeGroupRepo.deleteByUUID(uuid);
    }
    // #endregion

    // #region checking
    public Mono<Boolean> existsByName(String name) {
        return attributeGroupRepo.existsByName(name);
    }

    public Mono<Long> countByFilter(String search) {
        return attributeGroupRepo.countByFilter(search);
    }
    // #endregion

}
