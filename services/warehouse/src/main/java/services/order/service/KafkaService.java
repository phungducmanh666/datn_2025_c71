package services.order.service;

import java.util.UUID;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import services.order.model.kafka.KafkaOrderDTO;

@Service
@RequiredArgsConstructor
public class KafkaService {
  private final KafkaTemplate<String, Object> kafkaTemplate;

  public void processingOrder(UUID orderUUID, Boolean isSuccess) {
    kafkaTemplate.send("processingOrder", KafkaOrderDTO.builder().orderUUID(orderUUID).isComfirmed(isSuccess).build());
  }

  public void exportOrder(UUID orderUUID, Boolean isSuccess) {
    kafkaTemplate.send("exportOrder", KafkaOrderDTO.builder().orderUUID(orderUUID).isComfirmed(isSuccess).build());
  }

}
