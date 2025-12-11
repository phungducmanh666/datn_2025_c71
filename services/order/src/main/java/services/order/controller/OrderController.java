package services.order.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.model.constant.OrderStatus;
import services.order.model.query.OrderStatusCount;
import services.order.model.request.CreateOrderRequest;
import services.order.model.response.OrderResponse;
import services.order.model.response.OrderStatisticDTO;
import services.order.service.OrderService;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  @PostMapping
  public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest data) {
    return ResponseEntity.ok().body(orderService.createOrder(data));
  }

  @PostMapping("/{uuid}/comfirm")
  public ResponseEntity<Void> comfirmOrder(@PathVariable UUID uuid) {
    orderService.comfirmOrder(uuid);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{uuid}/cancle")
  public ResponseEntity<Void> cancleOrder(@PathVariable UUID uuid) {
    orderService.cancleOrder(uuid);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{uuid}/shipping")
  public ResponseEntity<Void> shippingOrder(@PathVariable UUID uuid) {
    orderService.shippingOrder(uuid);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{uuid}/da-thu-tien")
  public ResponseEntity<Void> xacNhanDaThuTienOrder(@PathVariable UUID uuid) {
    orderService.xacNhanDaThuTien(uuid);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{uuid}/return")
  public ResponseEntity<Void> returnOrder(@PathVariable UUID uuid) {
    orderService.returnOrder(uuid);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{uuid}/returned")
  public ResponseEntity<Void> returnedOrder(@PathVariable UUID uuid) {
    orderService.comfirmReturnedOrder(uuid);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/{uuid}/success")
  public ResponseEntity<Void> sucessOrder(@PathVariable UUID uuid) {
    orderService.successOrder(uuid);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{uuid}")
  public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID uuid) {
    return ResponseEntity.ok().body(orderService.getOrder(uuid));
  }

  @GetMapping
  public ResponseEntity<Page<OrderResponse>> getOrders(
      @RequestParam(required = false, defaultValue = "0") Integer page,
      @RequestParam(required = false, defaultValue = "10") Integer size,
      @RequestParam(required = false) String sort,
      @RequestParam(required = false) OrderStatus status,
      @RequestParam(required = false, name = "customer-uuid") UUID customerUUID) {
    return ResponseEntity.ok().body(orderService.getOrders(
        status,
        customerUUID,
        page,
        size,
        sort));
  }

  @GetMapping("/customer-order/{customerUUID}")
  public ResponseEntity<List<OrderResponse>> getCustomerOrders(@PathVariable UUID customerUUID) {
    return ResponseEntity.ok().body(orderService.getOrdersByCustomerUUID(customerUUID));
  }

  @GetMapping("/status-statistics")
  public ResponseEntity<List<OrderStatusCount>> getOrderStatusStatistics() {
    return ResponseEntity.ok().body(orderService.getOrderStatusStatistics());
  }

  @GetMapping("/statistics")
  public ResponseEntity<List<OrderStatisticDTO>> getOrderStatistics(
      @RequestParam(name = "start") LocalDate startDate,
      @RequestParam(name = "end") LocalDate endDate) {
    return ResponseEntity.ok().body(orderService.getStatistics(startDate, endDate));
  }

}
