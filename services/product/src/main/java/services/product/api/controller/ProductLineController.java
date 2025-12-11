package services.product.api.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import services.product.api.service.ProductLineService;
import services.product.core.model.database.ProductLineData;

@RestController
@RequestMapping("/product-lines")
@RequiredArgsConstructor
public class ProductLineController {
  private final ProductLineService productLineService;

  // #region crud
  @GetMapping("/{uuid}")
  public Mono<ResponseEntity<ProductLineData>> getByUUID(@PathVariable UUID uuid) {
    return productLineService.getByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }

  @PatchMapping("/{uuid}/name")
  public Mono<ResponseEntity<Long>> updateNameByUUID(
      @PathVariable UUID uuid,
      @RequestParam(name = "name") String value) {
    return productLineService.updateNameByUUID(uuid, value).map(rs -> ResponseEntity.ok().body(rs));
  }

  @DeleteMapping("/{uuid}")
  public Mono<ResponseEntity<Long>> deleteByUUID(
      @PathVariable UUID uuid) {
    return productLineService.deleteByUUID(uuid).map(rs -> ResponseEntity.ok().body(rs));
  }
  // #endregion
}
