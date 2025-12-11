package services.order.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.model.response.PayForOrderResponse;
import services.order.model.response.ZaloPayOrderResponse;
import services.order.model.response.ZaloPayRefundResponse;
import services.order.model.response.ZaloPayResponse;
import services.order.service.ZaloPayService;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class ZaloPayController {

  private final ZaloPayService zaloPayService;

  @PostMapping("/pay")
  public ResponseEntity<PayForOrderResponse> payForOrder(
      @RequestParam(name = "order-uuid") UUID orderUUID,
      @RequestParam(name = "redirect-url") String redirectUrl) {
    ZaloPayResponse response = zaloPayService.processPayment(orderUUID, redirectUrl);
    PayForOrderResponse res = new PayForOrderResponse();
    if (response instanceof ZaloPayOrderResponse) {
      // create new zp order payment
      ZaloPayOrderResponse createRes = (ZaloPayOrderResponse) response;
      res.setIsPaid(false);
      res.setOrderUrl(createRes.getOrderUrl());
    } else {
      // paid
      res.setIsPaid(true);
    }
    return ResponseEntity.ok().body(res);
  }

  @PostMapping("/refund")
  public ResponseEntity<ZaloPayRefundResponse> refundOrder(
      @RequestParam(name = "order-uuid") UUID orderUUID) {
    return ResponseEntity.ok().body(zaloPayService.refundOrder(orderUUID));
  }

  @GetMapping("/check-refund")
  public ResponseEntity<?> checkOrderRefund(
      @RequestParam(name = "order-uuid") UUID orderUUID) {
    return ResponseEntity.ok().body(zaloPayService.checkRefundStatus(orderUUID));
  }

}
