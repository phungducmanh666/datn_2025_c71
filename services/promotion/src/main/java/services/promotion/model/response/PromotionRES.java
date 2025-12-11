package services.promotion.model.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;
import services.promotion.model.constant.PromotionStatus;
import services.promotion.model.entity.PromotionEntity;

@Builder
@Data
public class PromotionRES {

  private Long id;
  private String title;
  private String description;
  private PromotionStatus status;
  private LocalDateTime startAt;
  private LocalDateTime endAt;
  private LocalDateTime CreatedAt;
  private List<PromotionConditionRES> conditions;
  private List<PromotionDetailRES> details;
  private UUID staffUUID;

  public static PromotionRES fromEntity(PromotionEntity promotionEntity) {
    return PromotionRES.builder()
        .staffUUID(promotionEntity.getStaffUUID())
        .id(promotionEntity.getId())
        .title(promotionEntity.getTitle())
        .description(promotionEntity.getDescription())
        .status(promotionEntity.getStatus())
        .startAt(promotionEntity.getStartAt())
        .endAt(promotionEntity.getEndAt())
        .CreatedAt(promotionEntity.getCreatedAt())
        .conditions(PromotionConditionRES.fromEntities(promotionEntity.getConditions()))
        .details(PromotionDetailRES.fromEntities(promotionEntity.getDetails()))
        .build();
  }
}
