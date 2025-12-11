package services.order.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.model.response.OrderDTO;

@RestController
@RequestMapping("/exports")
@RequiredArgsConstructor
public class ExportController {

  @GetMapping
  public ResponseEntity<Page<OrderDTO>> getExports(
      Integer page,
      Integer size,
      String sort,
      String search) {
    return null;
  }

  @GetMapping("/{uuid}")
  public ResponseEntity<OrderDTO> getExport(
      @PathVariable UUID uuid) {
    return null;
  }

}
