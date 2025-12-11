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
import services.product.api.service.BrandService;
import services.product.core.model.database.BrandData;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class BrandController {
  private final BrandService brandService;

  // #region crud
  @PostMapping
  public Mono<ResponseEntity<BrandData>> create(@RequestParam String name) {
    return brandService.create(name).map(rs -> ResponseEntity.ok().body(rs));
  }

  @GetMapping(produces = MediaType.APPLICATION_NDJSON_VALUE)
  public Mono<ResponseEntity<Flux<BrandData>>> getByFilter(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) String search) {

    Flux<BrandData> items = brandService.getByFilter(page, size, sort, search);
    Mono<Long> total = brandService.countByFilter(search);

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
  public Mono<ResponseEntity<BrandData>> getByUUID(@PathVariable UUID uuid) {
    return brandService.getByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/name")
  public Mono<ResponseEntity<Long>> updateNameByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "name") String value) {
    return brandService.updateNameByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/photo-url")
  public Mono<ResponseEntity<Long>> updatePhotoUrlByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "photo-url", required = false) String value) {
    return brandService.updatePhotoUrlByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteByUUID(
      @PathVariable UUID uuid) {
    return brandService.deleteByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion

  // #region checking
  @GetMapping("/check-name")
  public Mono<ResponseEntity<Boolean>> checkNameExists(@RequestParam String name) {
    return brandService.existsByName(name).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion
}
