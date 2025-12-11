package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.BrandRepo;
import services.product.core.model.database.BrandData;

@Service
@RequiredArgsConstructor
public class BrandService {
    private final BrandRepo catalogRepo;

    // #region crud
    public Mono<BrandData> create(String name) {
        return catalogRepo.create(name);
    }

    public Mono<BrandData> getByUUID(UUID uuid) {
        return catalogRepo.getByUUID(uuid);
    }

    public Flux<BrandData> getByFilter(Integer page, Integer size, String sort, String search) {
        return catalogRepo.getByFilter(page, size, sort, search);
    }

    public Mono<Long> updateNameByUUID(UUID uuid, String name) {
        return catalogRepo.updateNameByUUID(uuid, name);
    }

    public Mono<Long> updatePhotoUrlByUUID(UUID uuid, String photoUrl) {
        return catalogRepo.updatePhotoUrlByUUID(uuid, photoUrl);
    }

    public Mono<Long> deleteByUUID(UUID uuid) {
        return catalogRepo.deleteByUUID(uuid);
    }
    // #endregion

    // #region checking
    public Mono<Boolean> existsByName(String name) {
        return catalogRepo.existsByName(name);
    }

    public Mono<Long> countByFilter(String search) {
        return catalogRepo.countByFilter(search);
    }
    // #endregion

}
