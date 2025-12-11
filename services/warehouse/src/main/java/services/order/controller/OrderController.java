package services.order.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.model.request.CreateOrderDTO;
import services.order.model.request.CreateReceiptDTO;
import services.order.model.response.OrderDTO;
import services.order.service.OrderService;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
public class OrderController {

  private final OrderService orderService;

  @PostMapping
  public ResponseEntity<OrderDTO> createOrder(
      @RequestHeader(name = "x-user-uuid", required = false) String userUUID,
      @RequestBody CreateOrderDTO data) {
    try {
      UUID staffUUID = UUID.fromString(userUUID);
      return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(data, staffUUID));
    } catch (Exception e) {
      throw new RuntimeException("Vui lòng đăng nhập để tạo đơn hàng");

    }

  }

  @GetMapping
  public ResponseEntity<Page<OrderDTO>> getOrders(
      Integer page,
      Integer size,
      String sort,
      String search) {
    return ResponseEntity.ok().body(orderService.getOrders(page, size, sort));
  }

  @GetMapping("/{uuid}")
  public ResponseEntity<OrderDTO> getOrder(
      @PathVariable UUID uuid) {
    return ResponseEntity.ok().body(orderService.getOrder(uuid));
  }

  @PostMapping("/{uuid}/recipts")
  public ResponseEntity<Void> receiptOrder(
      @PathVariable UUID uuid,
      @RequestBody CreateReceiptDTO data) {
    orderService.reciptOrder(uuid, data);
    return ResponseEntity.noContent().build();
  }

}
