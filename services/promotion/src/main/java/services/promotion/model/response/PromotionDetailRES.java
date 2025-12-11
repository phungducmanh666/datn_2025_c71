package services.promotion.model.response;

import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import services.promotion.model.constant.DiscountType;
import services.promotion.model.entity.PromotionDetailEntity;

@Builder
@Data
public class PromotionDetailRES {
  private Long id;
  private UUID productUUID;
  private DiscountType discountType;
  private Long discountValue;
  private Long promotionId;

  public static PromotionDetailRES fromEntity(PromotionDetailEntity entity) {
    return PromotionDetailRES.builder()
        .id(entity.getId())
        .discountType(entity.getDiscountType())
        .discountValue(entity.getDiscountValue())
        .productUUID(entity.getProductUUID())
        .promotionId(entity.getPromotion().getId())
        .build();
  }

  public static List<PromotionDetailRES> fromEntities(List<PromotionDetailEntity> entities) {
    if (entities == null || entities.isEmpty())
      return List.of();
    List<PromotionDetailRES> res = entities.stream().map(PromotionDetailRES::fromEntity).toList();
    return res;
  }
}
