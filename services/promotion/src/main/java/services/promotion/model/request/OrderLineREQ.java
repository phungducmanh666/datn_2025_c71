package services.promotion.model.request;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrderLineREQ {
  private UUID productUUID;
  private Integer number;
  private Long unitPrice;
}
