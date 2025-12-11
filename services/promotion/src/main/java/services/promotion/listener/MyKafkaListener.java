package services.promotion.listener;
// package services.order.listener;

// import org.springframework.kafka.annotation.KafkaListener;
// import org.springframework.stereotype.Service;

// import lombok.RequiredArgsConstructor;
// import services.order.model.kafka.KafkaOrderDTO;
// import services.order.repo.OrderRepo;
// import services.order.service.OrderService;

// @Service
// @RequiredArgsConstructor
// public class MyKafkaListener {

// private final OrderService orderService;
// private final OrderRepo orderRepo;

// @KafkaListener(topics = "processingOrder")
// public void listenProcessingOrder(KafkaOrderDTO dto) {
// if (dto.getIsComfirmed()) {
// orderService.realComfirmOrder(dto.getOrderUUID());
// } else {
// orderService.cancleOrder(dto.getOrderUUID());
// }
// }

// @KafkaListener(topics = "exportOrder")
// public void listenExportOrder(KafkaOrderDTO dto) {
// if (dto.getIsComfirmed()) {
// orderService.realShippingOrder(dto.getOrderUUID());
// } else {
// orderService.cancleOrder(dto.getOrderUUID());
// }
// }

// }
