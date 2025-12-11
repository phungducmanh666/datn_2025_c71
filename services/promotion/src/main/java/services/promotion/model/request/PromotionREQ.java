package services.promotion.model.request;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class PromotionREQ {
  private String title;
  private String description;
  private List<PromotionConditionREQ> conditions;
  private List<PromotionDetailREQ> details;
  private LocalDateTime startAt;
  private LocalDateTime endAt;
}
