package services.order.model.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZaloPayOrderRequest {
  private String appTransId;
  private Long amount;
  private String description;
  private String redirectUrl;
  private String appUser;
  private String bankCode;
}
