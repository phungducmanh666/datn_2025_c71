package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.CatalogBrandRepo;
import services.product.core.model.database.BrandData;

@Service
@RequiredArgsConstructor
public class CatalogBrandService {

  private final CatalogBrandRepo catalogBrandRepo;

  public Mono<Void> createConnection(UUID catalogUUID, UUID brandUUID) {
    return catalogBrandRepo.pairsExists(catalogUUID, brandUUID)
        .flatMap(exists -> {
          if (exists) {
            // Đã tồn tại → không insert, return Mono.empty()
            return Mono.empty();
          } else {
            return catalogBrandRepo.createConnection(catalogUUID, brandUUID);
          }
        });
  }

  public Mono<Long> removeConnection(UUID catalogUUID, UUID brandUUID) {
    return catalogBrandRepo.pairsExists(catalogUUID, brandUUID)
        .flatMap(exists -> {
          if (exists) {
            return catalogBrandRepo.removeConnection(catalogUUID, brandUUID);
          } else {
            return Mono.empty();
          }
        });
  }

  public Flux<BrandData> getByCatalogFilter(UUID catalogUUID, Integer page, Integer size, String sort, String search) {
    return catalogBrandRepo.getByCatalogAndFilter(catalogUUID, page, size, sort, search);
  }

  public Mono<Long> countByCatalogFilter(UUID catalogUUID, String search) {
    return catalogBrandRepo.countByCatalogFilter(catalogUUID, search);
  }
}
