package services.product.api.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.service.AttributeValueService;
import services.product.api.service.ProductService;
import services.product.core.eum.EProductStatus;
import services.product.core.model.database.AttributeGroupData;
import services.product.core.model.database.ProductData;
import services.product.core.model.database.ProductImageData;
import services.product.core.model.database.ProductLineData;
import services.product.core.model.database.ProductStatusStatisticData;
import services.product.core.model.request.RequestCreateProductData;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

  private final ProductService productService;
  private final AttributeValueService attributeValueService;

  // #region product
  @PostMapping
  public Mono<ResponseEntity<ProductData>> create(@RequestBody RequestCreateProductData data) {
    return productService.create(data).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<ProductData>>> getByFilter(
      @RequestParam(required = false, name = "catalog-uuid") UUID catalogUUID,
      @RequestParam(required = false, name = "brand-uuid") UUID brandUUID,
      @RequestParam(required = false, name = "product-line-uuids") List<UUID> productLineUUIDS,
      @RequestParam(required = false, name = "price") List<BigDecimal> priceRange,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<ProductData> items = productService.getByFilter(catalogUUID, brandUUID, productLineUUIDS, priceRange, page,
        size, sort, search);
    Mono<Long> total = productService.countByFilter(catalogUUID, brandUUID, productLineUUIDS, priceRange, search);

    return total.map(count -> {

      HttpHeaders headers = new HttpHeaders();
      headers.add("X-Total-Items", String.valueOf(count));
      if (page != null) {
        headers.add("X-Current-Page", String.valueOf(page));
      }
      if (size != null) {
        headers.add("X-Page-Size", String.valueOf(size));
      }

      return ResponseEntity.ok()
          .headers(headers)
          .body(items);

    });
  }

  @GetMapping("/{uuid}/json")
  public Mono<ResponseEntity<String>> getProductJsonInfo(
      @PathVariable UUID uuid) {
    return productService.getProductInfo(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping("/{uuid}")
  public Mono<ResponseEntity<ProductData>> getByUUID(
      @PathVariable UUID uuid) {
    return productService.getByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteByUUID(
      @PathVariable UUID uuid) {
    return productService.deleteByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/name")
  public Mono<ResponseEntity<Long>> updateNameByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "name") String value) {
    return productService.updateNameByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/unit-price")
  public Mono<ResponseEntity<Long>> updatePriceByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "unit-price") BigDecimal value) {
    return productService.updatePriceByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/status")
  public Mono<ResponseEntity<Long>> updateStatusByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "status") EProductStatus value) {
    return productService.updateStatusByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/photo-url")
  public Mono<ResponseEntity<Long>> updatePhotoURLByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "photo-url") String value) {
    return productService.updatePhotoUrlByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  // #endregion

  // #region image
  @PostMapping("/{uuid}/images")
  public Mono<ResponseEntity<Void>> addImage(
      @PathVariable UUID uuid,
      @RequestParam(name = "photo-url") String photoUrl) {
    return productService.addImage(uuid, photoUrl).map(rs -> ResponseEntity.noContent().build());
  }

  @GetMapping(value = "/{uuid}/images", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<ProductImageData>>> getImageByUUID(@PathVariable UUID uuid) {
    return Mono.just(ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_NDJSON)
        .body(productService.getImageByUUID(uuid)));
  }

  @DeleteMapping("/{uuid}/images/{imageUUID}")
  public Mono<ResponseEntity<Long>> deleteImageByUUID(
      @PathVariable UUID uuid,
      @PathVariable UUID imageUUID) {
    return productService.deleteImageByUUID(imageUUID).map(rs -> ResponseEntity.ok().body(rs));
  }

  // #endregion

  // #region attribute
  @PostMapping("/{uuid}/attributes")
  public Mono<ResponseEntity<Void>> addAttribute(
      @PathVariable UUID uuid,
      @RequestParam(name = "attribute-uuid") UUID attributeUUID) {
    return productService.addAttribute(uuid, attributeUUID).map(rs -> ResponseEntity.noContent().build());
  }

  @GetMapping("/{uuid}/attributes")
  public Mono<ResponseEntity<Flux<AttributeGroupData>>> getAttributeByUUID(
      @PathVariable UUID uuid) {
    return Mono.just(ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_NDJSON)
        .body(productService.getAttributeByUUID(uuid)));
  }

  @DeleteMapping("/{uuid}/attributes/{attributeUUID}")
  public Mono<ResponseEntity<Long>> deleteAttributeByUUID(
      @PathVariable UUID uuid,
      @PathVariable UUID attributeUUID) {
    return productService.deleteAttributeByUUID(uuid, attributeUUID).map(rs -> ResponseEntity.ok().body(rs));
  }

  // #endregion

  // #region attribute value
  @PostMapping("/{uuid}/attributes/{attributeUUID}/values")
  public Mono<ResponseEntity<Void>> addAttributeValue(
      @PathVariable UUID uuid,
      @PathVariable UUID attributeUUID,
      @RequestParam String value) {
    return productService.addAttributeValue(uuid, attributeUUID, value).map(rs -> ResponseEntity.noContent().build());
  }

  @DeleteMapping("/{uuid}/attributes/{attributeUUID}/values/{valueUUID}")
  public Mono<ResponseEntity<Long>> deleteAttributeValue(
      @PathVariable UUID uuid,
      @PathVariable UUID attributeUUID,
      @PathVariable UUID valueUUID) {
    return attributeValueService.deleteByUUID(valueUUID).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  // #region checking
  @GetMapping("/check-name")
  public Mono<ResponseEntity<Boolean>> checkNameExists(@RequestParam String name) {
    return productService.existsByName(name).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  // #region status
  @GetMapping(value = "/status", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<Map<String, String>>>> getStatus() {
    Flux<Map<String, String>> flux = Flux.fromStream(
        Stream.of(EProductStatus.values())
            .map(status -> Map.of(
                "key", status.name(),
                "value", status.getValue())));

    return Mono.just(ResponseEntity.ok(flux));
  }

  // #endregion

  // #region product line
  @GetMapping(value = "/{uuid}/product-lines", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<ProductLineData>>> getProductLines(@PathVariable UUID uuid) {
    return Mono.just(ResponseEntity.ok().body(productService.getProductLines(uuid)));
  }
  // #endregion

  // #region statistic
  @GetMapping(value = "/status-statistics", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<ProductStatusStatisticData>>> getStatistics() {
    return Mono.just(ResponseEntity.ok().body(productService.getProductStatisStatistics()));
  }
  // #endregion

}
