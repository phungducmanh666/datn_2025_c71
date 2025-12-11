package services.order.model.response;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.constant.OrderStatus;
import services.order.model.constant.PaymentMethod;
import services.order.model.entity.OrderDiscountEntity;
import services.order.model.entity.OrderEntity;
import services.order.model.entity.OrderLineEntity;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrderResponse {

  @AllArgsConstructor
  @NoArgsConstructor
  @Data
  @Builder
  public static class OrderDiscountResponse {
    private Long id;
    private Long discountId;

    public static OrderDiscountResponse fromEntity(OrderDiscountEntity entity) {
      return entity == null ? null
          : OrderDiscountResponse.builder()
              .id(entity.getId())
              .discountId(entity.getDiscountId())
              .build();
    }
  }

  @AllArgsConstructor
  @NoArgsConstructor
  @Data
  @Builder
  public static class OrderLineResponse {
    private UUID uuid;
    private UUID productUUID;
    private Integer number;
    private Long unitPrice;
    private Long finalUnitPrice;
    private Long discountId;
    private ReviewResponse review;

    public static OrderLineResponse fromEntity(OrderLineEntity entity) {
      return entity == null ? null
          : OrderLineResponse.builder()
              .uuid(entity.getUuid())
              .productUUID(entity.getProductUUID())
              .number(entity.getNumber())
              .unitPrice(entity.getUnitPrice())
              .finalUnitPrice(entity.getFinalUnitPrice())
              .discountId(entity.getDiscountId())
              .review(ReviewResponse.fromEntity(entity.getReview()))
              .build();
    }
  }

  private UUID uuid;
  private String note;
  private UUID customerUUID;
  private LocalDateTime createdAt;
  private OrderStatus status;
  private Long totalAmount;
  private Long totalSaved;
  private PaymentMethod paymentMethod;

  private PaymentResponse payment;
  private RefundResponse refund;
  private DeliveryInfoResponse deliveryInfomation;
  private List<OrderLineResponse> items;
  private List<OrderDiscountResponse> discounts;

  public static OrderResponse fromEntity(OrderEntity entity) {
    if (entity == null)
      return null;

    // order lines
    List<OrderLineResponse> orderLines = new LinkedList<>();
    if (entity.getOrderLines() != null) {
      for (OrderLineEntity item : entity.getOrderLines()) {
        orderLines.add(
            OrderLineResponse.fromEntity(item));
      }
    }

    // discounts
    List<OrderDiscountResponse> discounts = new LinkedList<>();
    if (entity.getDiscounts() != null) {
      for (OrderDiscountEntity item : entity.getDiscounts()) {
        discounts.add(
            OrderDiscountResponse.fromEntity(item));
      }
    }

    return OrderResponse.builder()
        .uuid(entity.getUuid())
        .note(entity.getNote())
        .customerUUID(entity.getCustomerUUID())
        .createdAt(entity.getCreatedAt())
        .status(entity.getStatus())
        .totalAmount(entity.getTotalAmount())
        .totalSaved(entity.getTotalSaved())
        .paymentMethod(entity.getPaymentMethod())
        .payment(PaymentResponse.fromEntity(entity.getPayment()))
        .refund(RefundResponse.fromEntity(entity.getRefund()))
        .deliveryInfomation(DeliveryInfoResponse.fromEntity(entity.getDeliveryInfomation()))
        .items(orderLines)
        .discounts(discounts)
        .build();
  }
}
