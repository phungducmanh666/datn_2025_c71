package services.order.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.model.entity.SupplierEntity;
import services.order.model.response.SupplierDTO;
import services.order.service.SupplierService;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

  private final SupplierService supplierService;

  @PostMapping
  public ResponseEntity<SupplierEntity> createSupplier(
      @RequestParam String name,
      @RequestParam(name = "contact-info") String contactInfo,
      @RequestParam String address) {
    SupplierEntity supplier = supplierService.createSupplier(name, contactInfo, address);
    return ResponseEntity.status(HttpStatus.CREATED).body(supplier);
  }

  @GetMapping
  public ResponseEntity<Page<SupplierDTO>> getSuppliers(
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer size,
      @RequestParam(required = false) String sort) {
    return ResponseEntity.ok(supplierService.getSuppliers(page, size, sort));
  }

  @GetMapping("/{id}")
  public ResponseEntity<SupplierEntity> getSupplier(@PathVariable UUID id) {
    SupplierEntity supplier = supplierService.findSupplier(id);
    return ResponseEntity.ok(supplier);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteSupplier(@PathVariable UUID id) {
    supplierService.deleteSupplier(id);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/check-name")
  public ResponseEntity<Boolean> checkName(@RequestParam String name) {
    return ResponseEntity.ok(supplierService.isNameExists(name));
  }
}