package services.promotion.model.kafka;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class KafkaOrderDTO {

  @AllArgsConstructor
  @NoArgsConstructor
  @Data
  @Builder
  public static class OrderLineDto {
    private UUID productUUID;
    private Integer number;
  }

  private UUID orderUUID;
  private Boolean isComfirmed;
  private List<OrderLineDto> items;

}
