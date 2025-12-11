package services.promotion.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import services.promotion.model.response.PromotionConditionRES;
import services.promotion.repo.PromotionConditionRepository;

@Service
@RequiredArgsConstructor
public class PromotionConditionService {
  private final PromotionConditionRepository promotionConditionRepository;

  public List<PromotionConditionRES> getPromotionConditions(List<Long> ids) {
    if (ids == null || ids.size() == 0)
      return List.of();
    return PromotionConditionRES.fromEntities(
        promotionConditionRepository.getByIds(ids));
  }
}
