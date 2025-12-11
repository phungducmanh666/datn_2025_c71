package services.order.model.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class OrderStatisticDTO {
  private LocalDate date;
  private Long totalOrders;
  private Long totalAmount;
  private Long totalSuccessAmount;

}
