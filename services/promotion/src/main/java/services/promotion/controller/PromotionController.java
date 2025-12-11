package services.promotion.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.promotion.model.constant.PromotionStatus;
import services.promotion.model.request.PromotionREQ;
import services.promotion.model.response.PromotionConditionRES;
import services.promotion.model.response.PromotionDetailRES;
import services.promotion.model.response.PromotionRES;
import services.promotion.service.PromotionService;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {

  private final PromotionService promotionService;

  @PostMapping("/test")
  public String test(@RequestHeader(name = "x-user-uuid", required = false) String userUUID) {
    if (userUUID == null) {
      return "NULL";
    }
    return userUUID;
  }

  @PostMapping
  public ResponseEntity<?> createPromotion(@RequestBody PromotionREQ promotionREQ,
      @RequestHeader(name = "x-user-uuid", required = false) String userUUID) {
    try {
      UUID staffUUID = UUID.fromString(userUUID);
      return ResponseEntity.ok(promotionService.createPromotion(promotionREQ, staffUUID));

    } catch (Exception e) {
      throw new RuntimeException("Vui lòng đăng nhập để tạo khuyến mãi");

    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<PromotionRES> getPromotion(@PathVariable Long id) {
    return ResponseEntity.ok().body(promotionService.getPromotion(id));
  }

  @GetMapping
  public ResponseEntity<Page<PromotionRES>> getPromotions(
      @RequestParam(required = false, defaultValue = "0") Integer page,
      @RequestParam(required = false, defaultValue = "10") Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) PromotionStatus status) {
    return ResponseEntity.ok().body(promotionService.getPromotions(
        status,
        page,
        size,
        sort));
  }

  @PatchMapping("/{id}/status")
  public ResponseEntity<?> updatePromotionStatus(
      @PathVariable Long id,
      @RequestParam PromotionStatus status) {
    promotionService.updatePromotionStatus(id, status);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/product/{productUUID}")
  public ResponseEntity<List<PromotionDetailRES>> getPromotionsByProductUUID(
      @PathVariable UUID productUUID) {
    return ResponseEntity.ok().body(promotionService.getProductDiscount(productUUID));
  }

  @GetMapping("/discount-condition")
  public ResponseEntity<List<PromotionConditionRES>> getDiscountByPrice(
      @RequestParam(name = "total-discount-amount") Long totalDiscountAmount) {
    return ResponseEntity.ok().body(promotionService.getPromotionConditionsForOrder(totalDiscountAmount));
  }

}
