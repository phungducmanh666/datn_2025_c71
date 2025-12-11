package services.promotion.model.request;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.promotion.model.constant.DiscountType;
import services.promotion.model.entity.PromotionDetailEntity;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class PromotionDetailREQ {
  private UUID productUUID;
  private DiscountType discountType;
  private Long discountValue;

  public static PromotionDetailREQ fromEntity(PromotionDetailEntity entity) {
    return PromotionDetailREQ.builder()
        .discountType(entity.getDiscountType())
        .discountValue(entity.getDiscountValue())
        .productUUID(entity.getProductUUID())
        .build();
  }

  public static List<PromotionDetailREQ> fromEntities(List<PromotionDetailEntity> entities) {
    if (entities == null || entities.isEmpty())
      return List.of();
    return entities.stream().map(PromotionDetailREQ::fromEntity).toList();
  }
}
