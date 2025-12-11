package services.order.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ZaloPayOrderResponse extends ZaloPayResponse {
  private String orderUrl;
  private String zpTransToken;
  private Integer type; // 1: already paid, 2: new order created
  private Long paymentAmount;
  private Long discountAmount;
  private String zptransid;
}
