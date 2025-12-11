package services.order.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import services.order.model.entity.StockEntity;
import services.order.model.kafka.KafkaOrderDTO.OrderLineDto;
import services.order.repo.StockRepo;

@Service
@RequiredArgsConstructor
public class StockService {

  private final StockRepo stockRepo;

  public void checkProductForOrder(List<OrderLineDto> items) {
    for (OrderLineDto item : items) {
      StockEntity stockEntity = findStockEntity(item.getProductUUID());
      if (stockEntity.getNumber() < item.getNumber()) {
        throw new RuntimeException("quantity not available");
      }
    }
  }

  public StockEntity findStockEntity(UUID productUUID) {
    return stockRepo.findById(productUUID).orElseThrow(() -> new RuntimeException("Not found entity"));
  }

  public Integer getProductStock(UUID productUUID) {
    try {
      return findStockEntity(productUUID).getNumber();
    } catch (Exception e) {
      return 0;
    }
  }

}
