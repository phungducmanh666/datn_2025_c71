package services.order.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.service.StockService;

@RestController
@RequestMapping("/stocks")
@RequiredArgsConstructor
public class StockController {

  private final StockService stockService;

  @GetMapping("/{productUUID}")
  public ResponseEntity<Integer> getProductStocks(
      @PathVariable UUID productUUID) {
    return ResponseEntity.ok().body(stockService.getProductStock(productUUID));
  }

}
