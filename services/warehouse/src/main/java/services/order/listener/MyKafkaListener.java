package services.order.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import services.order.model.kafka.KafkaOrderDTO;
import services.order.service.ExportService;
import services.order.service.KafkaService;
import services.order.service.StockService;

@Service
@RequiredArgsConstructor
public class MyKafkaListener {

  private final KafkaService kafkaService;
  private final StockService stockService;
  private final ExportService exportService;

  @KafkaListener(topics = "confirmOrder")
  public void listenComfirmOrder(KafkaOrderDTO dto) {
    Boolean isSuccess = false;
    try {
      stockService.checkProductForOrder(dto.getItems());
      isSuccess = true;
    } catch (Exception e) {

    }
    kafkaService.processingOrder(dto.getOrderUUID(), isSuccess);
  }

  @KafkaListener(topics = "shippingOrder")
  public void listenShippingOrder(KafkaOrderDTO dto) {
    Boolean isSuccess = false;
    try {
      exportService.createExport(dto);
      isSuccess = true;
    } catch (Exception e) {
      System.out.println(String.format("\n\n\nLOIX: %s\n\n\n", e.getMessage()));
      e.printStackTrace();
    }
    kafkaService.exportOrder(dto.getOrderUUID(), isSuccess);
  }

}
