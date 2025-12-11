package services.order.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import services.order.model.entity.ShoppingCartEntity;
import services.order.service.ShoppingCartService;

@RestController
@RequestMapping("/carts") // Base URL: /carts
@RequiredArgsConstructor
public class ShoppingCartController {

  private final ShoppingCartService shoppingCartService;

  // --- 1. LẤY DANH SÁCH SẢN PHẨM TRONG GIỎ HÀNG (GET) ---

  /**
   * Lấy danh sách các mục trong giỏ hàng của một khách hàng cụ thể.
   * Endpoint: GET /carts?customerUuid={uuid}
   * 
   * @param customerUuid ID của khách hàng.
   * @return Danh sách các ShoppingCartEntity.
   */
  @GetMapping
  public ResponseEntity<List<ShoppingCartEntity>> getCartItems(
      @RequestParam(name = "customer-uuid") UUID customerUuid) {

    List<ShoppingCartEntity> items = shoppingCartService.getCartItemsByCustomer(customerUuid);
    return ResponseEntity.ok(items);
  }

  // --- 2. THÊM SẢN PHẨM VÀO GIỎ HÀNG (POST) ---

  /**
   * Thêm một sản phẩm mới vào giỏ hàng.
   * Endpoint: POST /carts/add
   * 
   * @param request DTO chứa customerUuid và productUuid.
   * @return ShoppingCartEntity vừa được thêm.
   */
  @PostMapping
  public ResponseEntity<ShoppingCartEntity> addItemToCart(
      @RequestParam(name = "customer-uuid") UUID customerUuid,
      @RequestParam(name = "product-uuid") UUID productUuid) {

    ShoppingCartEntity newItem = shoppingCartService.addItemToCart(customerUuid, productUuid);
    // Trả về 201 Created khi tạo thành công
    return new ResponseEntity<>(newItem, HttpStatus.CREATED);
  }

  // --- 3. XÓA SẢN PHẨM KHỎI GIỎ HÀNG (DELETE) ---

  /**
   * Xóa một sản phẩm cụ thể khỏi giỏ hàng.
   * Endpoint: DELETE /carts?customerUuid={uuid}&productUuid={uuid}
   * 
   * @param customerUuid ID của khách hàng.
   * @param productUuid  ID của sản phẩm cần xóa.
   * @return 204 No Content nếu xóa thành công.
   */
  @DeleteMapping
  public ResponseEntity<Void> removeItemFromCart(
      @RequestParam(name = "customer-uuid") UUID customerUuid,
      @RequestParam(name = "product-uuid") UUID productUuid) {

    shoppingCartService.removeItemFromCart(customerUuid, productUuid);
    // Trả về 204 No Content (thành công nhưng không có nội dung trả về)
    return ResponseEntity.noContent().build();
  }

  // --- 4. XÓA TOÀN BỘ GIỎ HÀNG (DELETE) ---

  /**
   * Xóa toàn bộ giỏ hàng của một khách hàng.
   * Endpoint: DELETE /carts/clear?customerUuid={uuid}
   * 
   * @param customerUuid ID của khách hàng.
   * @return 204 No Content nếu xóa thành công.
   */
  @DeleteMapping("/clear")
  public ResponseEntity<Void> clearCart(
      @RequestParam UUID customerUuid) {

    shoppingCartService.clearCart(customerUuid);
    return ResponseEntity.noContent().build();
  }
}