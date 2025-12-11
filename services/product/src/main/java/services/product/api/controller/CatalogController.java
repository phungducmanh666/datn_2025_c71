package services.product.api.controller;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import services.product.api.service.CatalogBrandService;
import services.product.api.service.CatalogService;
import services.product.api.service.ProductLineService;
import services.product.core.model.database.BrandData;
import services.product.core.model.database.CatalogData;
import services.product.core.model.database.ProductLineData;

@RestController
@RequestMapping("/catalogs")
@RequiredArgsConstructor
public class CatalogController {
  private final CatalogService catalogService;
  private final CatalogBrandService catalogBrandService;
  private final ProductLineService productLineService;

  // #region crud
  @PostMapping
  public Mono<ResponseEntity<CatalogData>> create(@RequestParam String name) {
    return catalogService.create(name).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<CatalogData>>> getByFilter(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<CatalogData> items = catalogService.getByFilter(page, size, sort, search);
    Mono<Long> total = catalogService.countByFilter(search);

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

  @GetMapping("/{uuid}")
  public Mono<ResponseEntity<CatalogData>> getByUUID(@PathVariable UUID uuid) {
    return catalogService.getByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/name")
  public Mono<ResponseEntity<Long>> updateNameByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "name") String value) {
    return catalogService.updateNameByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/photo-url")
  public Mono<ResponseEntity<Long>> updatePhotoUrlByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "photo-url", required = false) String value) {
    return catalogService.updatePhotoUrlByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteByUUID(
      @PathVariable UUID uuid) {
    return catalogService.deleteByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  // #region checking
  @GetMapping("/check-name")
  public Mono<ResponseEntity<Boolean>> checkNameExists(@RequestParam String name) {
    return catalogService.existsByName(name).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  // #region brand
  @PostMapping("/{catalogUUID}/brands")
  public Mono<ResponseEntity<Void>> createConnection(
      @PathVariable UUID catalogUUID,
      @RequestParam(name = "brand-uuid") UUID brandUUID) {
    return catalogBrandService.createConnection(catalogUUID, brandUUID)
        .then(Mono.just(ResponseEntity.ok().<Void>build()));
  }

  @GetMapping(value = "/{catalogUUID}/brands", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<BrandData>>> getByCatalogFilter(
      @PathVariable UUID catalogUUID,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<BrandData> items = catalogBrandService.getByCatalogFilter(catalogUUID, page, size, sort, search);
    Mono<Long> total = catalogBrandService.countByCatalogFilter(catalogUUID, search);

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

  @DeleteMapping("/{catalogUUID}/brands/{brandUUID}")
  public Mono<ResponseEntity<Long>> removeConnection(
      @PathVariable UUID catalogUUID,
      @PathVariable UUID brandUUID) {
    return catalogBrandService.removeConnection(catalogUUID, brandUUID).map(rs -> ResponseEntity.ok().body(rs));
  }

  // #endregion

  // #region product line
  @PostMapping("/{catalogUUID}/brands/{brandUUID}/product-lines")
  public Mono<ResponseEntity<ProductLineData>> create(
      @PathVariable UUID catalogUUID,
      @PathVariable UUID brandUUID,
      @RequestParam String name) {
    return productLineService.create(catalogUUID, brandUUID, name).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(value = "/{catalogUUID}/brands/{brandUUID}/product-lines", produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<ProductLineData>>> getByFilter(
      @PathVariable UUID catalogUUID,
      @PathVariable UUID brandUUID,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<ProductLineData> items = productLineService.getByFilter(catalogUUID, brandUUID, page, size, sort, search);
    Mono<Long> total = productLineService.countByFilter(catalogUUID, brandUUID, search);

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

  @GetMapping("/{catalogUUID}/brands/{brandUUID}/product-lines/check-name")
  public Mono<ResponseEntity<Boolean>> checkNameExists(
      @PathVariable UUID catalogUUID,
      @PathVariable UUID brandUUID,
      @RequestParam String name) {
    return productLineService.existsByName(catalogUUID, brandUUID, name).map(rs -> ResponseEntity.ok().body(rs));
  }

  // #endregion
}
