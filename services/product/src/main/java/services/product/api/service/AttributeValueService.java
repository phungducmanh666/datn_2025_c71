package services.product.api.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import services.product.api.repo.AttributeValueRepo;

@Service
@RequiredArgsConstructor
public class AttributeValueService {
    private final AttributeValueRepo attributeValueRepo;

    // #region crud
    public Mono<Long> deleteByUUID(UUID uuid) {
        return attributeValueRepo.deleteValue(uuid);
    }
    // #endregion

}
