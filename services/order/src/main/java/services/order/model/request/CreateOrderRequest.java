package services.order.model.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.constant.OrderStatus;
import services.order.model.constant.PaymentMethod;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CreateOrderRequest {

  @AllArgsConstructor
  @NoArgsConstructor
  @Data
  @Builder
  public static class OrderLine {
    private UUID productUUID;
    private Integer number;
    private Long unitPrice;
    private Long finalPrice;
    private Long discountId;
  }

  @AllArgsConstructor
  @NoArgsConstructor
  @Data
  @Builder
  public static class DeliveryInfo {
    private String recipientName;
    private String recipientPhoneNumber;
    private String deliveryAddress;
  }

  private UUID uuid;
  private String note;
  private UUID customerUUID;
  private LocalDateTime createdAt;
  private OrderStatus status;
  private PaymentMethod paymentMethod;
  private DeliveryInfo deliveryInfo;
  private List<OrderLine> items;
  private Long totalAmount;
  private Long totalSaved;
  private List<Long> discountIds;

}
