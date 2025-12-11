package services.promotion.model.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;
import services.promotion.model.constant.DiscountType;
import services.promotion.model.entity.PromotionConditionEntity;

@Builder
@Data
public class PromotionConditionRES {
  private Long id;
  private Long minimumValue;
  private DiscountType discountType;
  private Long discountValue;
  private Long promotionId;

  public static PromotionConditionRES fromEntity(PromotionConditionEntity entity) {
    return PromotionConditionRES.builder()
        .id(entity.getId())
        .discountType(entity.getDiscountType())
        .discountValue(entity.getDiscountValue())
        .minimumValue(entity.getMinimumValue())
        .promotionId(entity.getPromotion().getId())
        .build();
  }

  public static List<PromotionConditionRES> fromEntities(List<PromotionConditionEntity> entities) {
    if (entities == null || entities.isEmpty())
      return List.of();
    List<PromotionConditionRES> res = entities.stream().map(PromotionConditionRES::fromEntity).toList();
    return res;
  }
}
