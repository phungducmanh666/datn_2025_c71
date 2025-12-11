package services.order.model.response;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.OrderLineEntity;
import services.order.model.entity.PurchaseOrderEntity;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class OrderDTO {

  private UUID uuid;
  private UUID staffUUID;
  private String note;
  private LocalDateTime createdAt;
  private SupplierDTO supplier;
  private ReciptDTO receipt;
  private List<OrderItemDTO> items;

  public static OrderDTO fromEntity(PurchaseOrderEntity entity) {

    List<OrderItemDTO> items = new LinkedList<>();
    if (entity.getItems() != null) {
      for (OrderLineEntity item : entity.getItems()) {
        items.add(OrderItemDTO.fromEntity(item));
      }
    }

    return entity == null ? null
        : OrderDTO.builder()
            .uuid(entity.getUuid())
            .staffUUID(entity.getStaffUUID())
            .note(entity.getNote())
            .createdAt(entity.getCreatedAt())
            .supplier(SupplierDTO.fromEntity(entity.getSupplier()))
            .receipt(ReciptDTO.fromEntity(entity.getRecipt()))
            .items(items)
            .build();
  }

}
