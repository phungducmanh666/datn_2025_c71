package services.order.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.DeliveryInfomationEntity;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class DeliveryInfoResponse {
  private String recipientName;
  private String recipientPhoneNumber;
  private String deliveryAddress;

  public static DeliveryInfoResponse fromEntity(DeliveryInfomationEntity entity) {
    return entity == null ? null
        : DeliveryInfoResponse.builder()
            .recipientName(entity.getRecipientName())
            .recipientPhoneNumber(entity.getRecipientPhoneNumber())
            .deliveryAddress(entity.getDeliveryAddress())
            .build();
  }
}