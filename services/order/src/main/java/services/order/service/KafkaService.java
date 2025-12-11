package services.order.service;

import java.util.List;
import java.util.UUID;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import services.order.model.kafka.KafkaOrderDTO;

@Service
@RequiredArgsConstructor
public class KafkaService {
  private final KafkaTemplate<String, Object> kafkaTemplate;

  public void comfirmOrder(UUID orderUUID, List<KafkaOrderDTO.OrderLineDto> items) {
    kafkaTemplate.send("confirmOrder", KafkaOrderDTO.builder().orderUUID(orderUUID).items(items).build());
  }

  public void shippingOrder(UUID orderUUID, List<KafkaOrderDTO.OrderLineDto> items) {
    kafkaTemplate.send("shippingOrder", KafkaOrderDTO.builder().orderUUID(orderUUID).items(items).build());
  }
}
