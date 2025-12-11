package services.promotion.model.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrderREQ {
  private List<OrderLineREQ> items;

  public long calculateTotal() {
    return items.stream()
        .mapToLong(item -> item.getNumber() * item.getUnitPrice())
        .sum();
  }
}
