package services.order.model.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.PaymentEntity;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class PaymentResponse {
  private Long paymentAmount;
  private Long discountAmount;
  private String apptransid;
  private Long zptransid;
  private LocalDateTime createdAt;

  public static PaymentResponse fromEntity(PaymentEntity entity) {
    return entity == null ? null
        : PaymentResponse.builder()
            .paymentAmount(entity.getPaymentAmount())
            .discountAmount(entity.getDiscountAmount())
            .apptransid(entity.getApptransid())
            .zptransid(entity.getZptransid())
            .createdAt(entity.getCreatedAt())
            .build();
  }
}