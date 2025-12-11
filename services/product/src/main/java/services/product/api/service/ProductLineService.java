package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.ProductLineRepo;
import services.product.core.model.database.ProductLineData;

@Service
@RequiredArgsConstructor
public class ProductLineService {
    private final ProductLineRepo productLineRepo;

    // #region crud
    public Mono<ProductLineData> create(UUID catalogUUID, UUID brandUUID, String name) {
        return productLineRepo.create(catalogUUID, brandUUID, name);
    }

    public Mono<ProductLineData> getByUUID(UUID uuid) {
        return productLineRepo.getByUUID(uuid);
    }

    public Flux<ProductLineData> getByFilter(UUID catalogUUID, UUID brandUUID, Integer page, Integer size, String sort,
            String search) {
        return productLineRepo.getByFilter(catalogUUID, brandUUID, page, size, sort, search);
    }

    public Mono<Long> updateNameByUUID(UUID uuid, String name) {
        return productLineRepo.updateNameByUUID(uuid, name);
    }

    public Mono<Long> deleteByUUID(UUID uuid) {
        return productLineRepo.deleteByUUID(uuid);
    }
    // #endregion

    // #region checking
    public Mono<Boolean> existsByName(UUID catalogUUID, UUID brandUUID, String name) {
        return productLineRepo.existsByName(catalogUUID, brandUUID, name);
    }

    public Mono<Long> countByFilter(UUID catalogUUID, UUID brandUUID, String search) {
        return productLineRepo.countByFilter(catalogUUID, brandUUID, search);
    }
    // #endregion

}
