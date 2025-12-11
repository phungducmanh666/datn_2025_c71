package services.order.model.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.OrderLineEntity;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class OrderItemDTO {
  private UUID uuid;
  private UUID productUUID;
  private Integer orderNumber;
  private Integer receiptNumber;

  public static OrderItemDTO fromEntity(OrderLineEntity entity) {
    return entity == null ? null
        : OrderItemDTO.builder()
            .uuid(entity.getUuid())
            .productUUID(entity.getProductUUID())
            .orderNumber(entity.getOrderNumber())
            .receiptNumber(entity.getReceiptNumber())
            .build();
  }
}
