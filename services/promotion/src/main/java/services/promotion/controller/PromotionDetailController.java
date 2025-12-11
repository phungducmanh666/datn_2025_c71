package services.promotion.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.promotion.model.response.PromotionDetailRES;
import services.promotion.service.PromotionDetailService;

@RestController
@RequestMapping("/promotion-details")
@RequiredArgsConstructor
public class PromotionDetailController {

  private final PromotionDetailService promotionDetailService;

  @GetMapping("/{id}")
  public ResponseEntity<PromotionDetailRES> getPromotion(@PathVariable Long id) {
    return ResponseEntity.ok().body(promotionDetailService.getPromotionDetail(id));
  }

}
