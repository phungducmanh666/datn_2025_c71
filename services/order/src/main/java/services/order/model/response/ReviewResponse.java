package services.order.model.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.ReviewEntity;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ReviewResponse {
  private String content;
  private Integer star;
  private LocalDateTime createdAt;
  private UUID customerUUID;

  public static ReviewResponse fromEntity(ReviewEntity entity) {
    return entity == null ? null
        : ReviewResponse.builder()
            .content(entity.getContent())
            .customerUUID(entity.getOrderLine().getOrder().getCustomerUUID())
            .star(entity.getStar())
            .createdAt(entity.getCreatedAt())
            .build();
  }
}
