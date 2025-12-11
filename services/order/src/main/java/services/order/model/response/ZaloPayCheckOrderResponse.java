package services.order.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ZaloPayCheckOrderResponse extends ZaloPayResponse {
  private Boolean isProcessing;
  private Long paymentAmount;
  private Long discountAmount;
  private Long zptransid;
}
