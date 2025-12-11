package services.order.model.request;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateOrderDTO {
  private UUID supplierUUID;
  private String note;
  private List<CreateOrderItemDTO> items;
}