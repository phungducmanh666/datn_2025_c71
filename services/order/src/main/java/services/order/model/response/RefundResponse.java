package services.order.model.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.RefundEntity;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class RefundResponse {
  private String zprefundsid;
  private Long amount;
  private LocalDateTime createdAt;

  public static RefundResponse fromEntity(RefundEntity entity) {
    return entity == null ? null
        : RefundResponse.builder()
            .zprefundsid(entity.getZprefundsid())
            .amount(entity.getAmount())
            .createdAt(entity.getCreatedAt())
            .build();
  }
}