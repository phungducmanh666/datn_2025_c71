package services.order.model.request;

import java.util.UUID;

import lombok.Data;

@Data
public class AddToCartRequest {
  private UUID customerUuid;
  private UUID productUuid;
  // Bạn có thể thêm số lượng (quantity) ở đây nếu cần quản lý số lượng
  // private int quantity;
}
