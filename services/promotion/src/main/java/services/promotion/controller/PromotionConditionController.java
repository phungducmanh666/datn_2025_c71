package services.promotion.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.promotion.model.response.PromotionConditionRES;
import services.promotion.service.PromotionConditionService;

@RestController
@RequestMapping("/promotion-conditions")
@RequiredArgsConstructor
public class PromotionConditionController {

  private final PromotionConditionService promotionConditionService;

  @GetMapping()
  public ResponseEntity<List<PromotionConditionRES>> getPromotion(
      @RequestParam List<Long> ids

  ) {
    return ResponseEntity.ok().body(promotionConditionService.getPromotionConditions(ids));
  }

}
