package services.order.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import services.order.model.entity.ShoppingCartEntity;
// import services.order.model.entity.ShoppingCartEntity.ShoppingCartId; // Không cần thiết khi sử dụng UUID làm ID
import services.order.repo.ShoppingCartRepository;

@Service
@RequiredArgsConstructor // Tự động tạo constructor với các trường final
public class ShoppingCartService {

  // Inject Repository (tiêm Repository)
  private final ShoppingCartRepository shoppingCartRepository;

  /**
   * Thêm một sản phẩm vào giỏ hàng của khách hàng.
   * * @param customerUUID ID của khách hàng.
   * 
   * @param productUUID ID của sản phẩm.
   * @return ShoppingCartEntity đã được lưu.
   */
  @Transactional
  public ShoppingCartEntity addItemToCart(UUID customerUUID, UUID productUUID) {
    // 1. Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    Optional<ShoppingCartEntity> existingItem = shoppingCartRepository.findByCustomerUUIDAndProductUUID(customerUUID,
        productUUID);

    if (existingItem.isPresent()) {
      // Nếu đã có, bạn có thể xử lý theo 2 cách:
      // a) Bỏ qua/Không làm gì (Giả định mỗi mục là một sản phẩm, không quan tâm số
      // lượng)
      // b) Cập nhật số lượng (Nếu có trường 'quantity' trong entity)

      // Ở đây, giả sử cấu trúc hiện tại chỉ lưu trữ sự tồn tại (1:1)
      return existingItem.get(); // Trả về mục hiện có
    } else {
      // 2. Nếu chưa có, tạo một mục giỏ hàng mới
      ShoppingCartEntity newItem = new ShoppingCartEntity(
          null, // UUID sẽ được tự động tạo bởi @UuidGenerator
          customerUUID,
          productUUID);

      // 3. Lưu mục mới vào cơ sở dữ liệu
      return shoppingCartRepository.save(newItem);
    }
  }

  /**
   * Xóa một sản phẩm khỏi giỏ hàng.
   * * @param customerUuid ID của khách hàng.
   * 
   * @param productUuid  ID của sản phẩm cần xóa.
   */
  @Transactional
  public void removeItemFromCart(UUID customerUuid, UUID productUuid) {
    // 1. Tìm kiếm mục giỏ hàng cụ thể
    Optional<ShoppingCartEntity> itemToRemove = shoppingCartRepository.findByCustomerUUIDAndProductUUID(customerUuid,
        productUuid);

    // 2. Nếu tìm thấy, tiến hành xóa
    if (itemToRemove.isPresent()) {
      shoppingCartRepository.delete(itemToRemove.get());
    }
    // Lưu ý: Nếu không tìm thấy, không làm gì (hành vi thông thường)
  }

  /**
   * Lấy toàn bộ danh sách sản phẩm trong giỏ hàng của một khách hàng.
   * (Sử dụng phương thức tùy chỉnh đã định nghĩa trong Repository)
   * * @param customerUuid ID của khách hàng.
   * 
   * @return Danh sách các mục trong giỏ hàng của khách hàng.
   */
  @Transactional(readOnly = true)
  public List<ShoppingCartEntity> getCartItemsByCustomer(UUID customerUuid) {
    // ... (Phương thức này đã hoàn thiện)
    return shoppingCartRepository.findByCustomerUUID(customerUuid);
  }

  /**
   * Xóa toàn bộ giỏ hàng của một khách hàng.
   * * @param customerUuid ID của khách hàng.
   */
  @Transactional
  public void clearCart(UUID customerUuid) {
    // ... (Phương thức này đã hoàn thiện)
    List<ShoppingCartEntity> items = getCartItemsByCustomer(customerUuid);
    shoppingCartRepository.deleteAll(items);
  }
}