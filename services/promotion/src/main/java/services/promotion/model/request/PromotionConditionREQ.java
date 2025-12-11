package services.promotion.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.promotion.model.constant.DiscountType;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class PromotionConditionREQ {
  private Long minimumValue;
  private DiscountType discountType;
  private Long discountValue;
}
