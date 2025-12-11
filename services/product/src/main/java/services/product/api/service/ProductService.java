package services.product.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.repo.ProductAttributeRepo;
import services.product.api.repo.ProductImageRepo;
import services.product.api.repo.ProductRepo;
import services.product.core.eum.EProductStatus;
import services.product.core.model.database.AttributeGroupData;
import services.product.core.model.database.ProductData;
import services.product.core.model.database.ProductImageData;
import services.product.core.model.database.ProductLineData;
import services.product.core.model.database.ProductStatusStatisticData;
import services.product.core.model.request.RequestCreateProductData;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepo productRepo;
    private final ProductImageRepo productImageRepo;
    private final ProductAttributeRepo productAttributeRepo;

    // #region crud

    public Mono<String> getProductInfo(UUID uuid) {
        return productRepo.getProductInfo(uuid);
    }

    public Mono<ProductData> create(RequestCreateProductData data) {
        return productRepo.createProduct(data)
                .flatMap(productRepo::getProductByUUID); // map UUID → ProductData
    }

    public Flux<ProductData> getByFilter(
            UUID catalogUUID,
            UUID brandUUID,
            List<UUID> productLineUUIDS,
            List<BigDecimal> priceRange,
            Integer page,
            Integer size,
            String sort,
            String search) {
        return productRepo.getByFilter(catalogUUID, brandUUID, productLineUUIDS, priceRange, page, size, sort, search);
    }

    public Mono<Long> countByFilter(UUID catalogUUID,
            UUID brandUUID,
            List<UUID> productLineUUIDS,
            List<BigDecimal> priceRange,
            String search) {
        return productRepo.countByFilter(catalogUUID, brandUUID, productLineUUIDS, priceRange, search);
    }

    public Mono<Void> addImage(UUID uuid, String photoUrl) {
        return productImageRepo.addProductImage(uuid, photoUrl);
    }

    public Mono<Void> addAttribute(UUID uuid, UUID attributeUUID) {
        return productAttributeRepo.addProductAttribute(uuid, attributeUUID);
    }

    public Mono<ProductData> getByUUID(UUID uuid) {
        return productRepo.getProductByUUID(uuid);
    }

    public Flux<ProductImageData> getImageByUUID(UUID uuid) {
        return productImageRepo.getProductImages(uuid);
    }

    public Flux<AttributeGroupData> getAttributeByUUID(UUID uuid) {
        return productAttributeRepo.getProductAttributes(uuid);
    }

    public Mono<Long> deleteByUUID(UUID uuid) {
        return productRepo.deleteByUUID(uuid);
    }

    public Mono<Long> deleteImageByUUID(UUID imageUUID) {
        return productImageRepo.deleteByUUID(imageUUID);
    }

    public Mono<Long> deleteAttributeByUUID(UUID uuid, UUID attributeUUID) {
        return productAttributeRepo.deleteByProductUUIDAndAttributeUUID(uuid, attributeUUID);
    }

    public Mono<Long> updateNameByUUID(UUID uuid, String value) {
        return productRepo.updateNameByUUID(uuid, value);
    }

    public Mono<Long> updatePhotoUrlByUUID(UUID uuid, String value) {
        return productRepo.updatePhotoURLByUUID(uuid, value);
    }

    public Mono<Long> updateStatusByUUID(UUID uuid, EProductStatus value) {
        return productRepo.updateStatusByUUID(uuid, value);
    }

    public Mono<Long> updatePriceByUUID(UUID uuid, BigDecimal value) {
        return productRepo.updatePriceByUUID(uuid, value);
    }

    public Mono<Void> addAttributeValue(UUID uuid, UUID attributeUUID, String value) {
        return productAttributeRepo.addAttributeValue(uuid, attributeUUID, value);
    }

    public Mono<Long> deleteAttributeValue(UUID uuid) {
        return productAttributeRepo.deleteAttributeValue(uuid);
    }

    public Mono<Boolean> existsByName(String name) {
        return productRepo.existsByName(name);
    }

    public Flux<ProductLineData> getProductLines(UUID productUUID) {
        return productRepo.getProductLines(productUUID);
    }

    // #region statstics
    public Flux<ProductStatusStatisticData> getProductStatisStatistics() {
        return productRepo.getProductStatisStatistics();
    }
    // #endregion
}
