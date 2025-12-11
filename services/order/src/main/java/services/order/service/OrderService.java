package services.order.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import services.order.model.constant.OrderStatus;
import services.order.model.constant.PaymentMethod;
import services.order.model.entity.DeliveryInfomationEntity;
import services.order.model.entity.OrderDiscountEntity;
import services.order.model.entity.OrderEntity;
import services.order.model.entity.OrderLineEntity;
import services.order.model.entity.PaymentEntity;
import services.order.model.kafka.KafkaOrderDTO;
import services.order.model.query.OrderStatusCount;
import services.order.model.request.CreateOrderRequest;
import services.order.model.response.OrderResponse;
import services.order.model.response.OrderStatisticDTO;
import services.order.repo.OrderRepo;
import services.order.specification.OrderSpecification;

@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderRepo orderRepo;
  private final KafkaService kafkaService;

  /**
   * Tạo đơn hàng mới
   * 
   * @param order OrderEntity cần tạo
   * @return OrderEntity đã được lưu
   */
  @Transactional
  public OrderResponse createOrder(CreateOrderRequest order) {

    // #region order
    OrderEntity orderEntity = new OrderEntity();
    String note = order.getNote();
    UUID customerUUID = order.getCustomerUUID();
    PaymentMethod paymentMethod = order.getPaymentMethod();
    OrderStatus status = OrderStatus.PENDING;
    Long totalAmount = order.getTotalAmount();
    Long totalSaved = order.getTotalSaved();
    List<Long> discountIds = order.getDiscountIds();

    orderEntity.setNote(note);
    orderEntity.setCustomerUUID(customerUUID);
    orderEntity.setPaymentMethod(paymentMethod);
    orderEntity.setStatus(status);
    orderEntity.setTotalAmount(totalAmount);
    orderEntity.setTotalSaved(totalSaved);

    for (Long discountId : discountIds) {
      OrderDiscountEntity orderDiscountEntity = new OrderDiscountEntity();
      orderDiscountEntity.setDiscountId(discountId);
      orderEntity.addDiscount(orderDiscountEntity);
    }

    // #endregion

    // #region order lines
    for (CreateOrderRequest.OrderLine item : order.getItems()) {
      OrderLineEntity orderLineEntity = new OrderLineEntity();
      orderLineEntity.setProductUUID(item.getProductUUID());
      orderLineEntity.setNumber(item.getNumber());
      orderLineEntity.setUnitPrice(item.getUnitPrice());
      orderLineEntity.setDiscountId(item.getDiscountId());
      orderLineEntity.setFinalUnitPrice(item.getFinalPrice());

      orderLineEntity.setOrder(orderEntity);
      orderEntity.addOrderLine(orderLineEntity);
    }
    // #endregion

    // #region delivery
    if (order.getDeliveryInfo() != null) {

      String recipientName = order.getDeliveryInfo().getRecipientName();
      String recipientPhoneNumber = order.getDeliveryInfo().getRecipientPhoneNumber();
      String deliveryAddress = order.getDeliveryInfo().getDeliveryAddress();

      DeliveryInfomationEntity deliveryInfomationEntity = new DeliveryInfomationEntity();
      deliveryInfomationEntity.setRecipientName(recipientName);
      deliveryInfomationEntity.setRecipientPhoneNumber(recipientPhoneNumber);
      deliveryInfomationEntity.setDeliveryAddress(deliveryAddress);

      deliveryInfomationEntity.setOrder(orderEntity);
      orderEntity.setDeliveryInfomation(deliveryInfomationEntity);
    }
    // #endregion

    return OrderResponse.fromEntity(orderRepo.save(orderEntity));
  }

  public void comfirmOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    List<KafkaOrderDTO.OrderLineDto> items = new LinkedList<>();
    for (OrderLineEntity item : orderEntity.getOrderLines()) {
      items.add(KafkaOrderDTO.OrderLineDto.builder()
          .productUUID(item.getProductUUID())
          .number(item.getNumber())
          .build());
    }

    kafkaService.comfirmOrder(orderUUID, items);
  }

  public void realComfirmOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    if (orderEntity.getStatus() == OrderStatus.PENDING) {
      orderEntity.setStatus(OrderStatus.PROCESSING);
      orderRepo.save(orderEntity);
    }
  }

  public void cancleOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    OrderStatus status = orderEntity.getStatus();
    if (status == OrderStatus.PROCESSING
        || status == OrderStatus.SHIPPING
        || status == OrderStatus.CANCLED
        || status == OrderStatus.RETURNING
        || status == OrderStatus.RETURNED
        || status == OrderStatus.SUCCESS)
      return;
    orderEntity.setStatus(OrderStatus.CANCLED);
    orderRepo.save(orderEntity);
  }

  public void shippingOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    List<KafkaOrderDTO.OrderLineDto> items = new LinkedList<>();
    for (OrderLineEntity item : orderEntity.getOrderLines()) {
      items.add(KafkaOrderDTO.OrderLineDto.builder()
          .productUUID(item.getProductUUID())
          .number(item.getNumber())
          .build());
    }

    kafkaService.shippingOrder(orderUUID, items);
  }

  public void realShippingOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    OrderStatus status = orderEntity.getStatus();
    if (status == OrderStatus.PROCESSING) {
      orderEntity.setStatus(OrderStatus.SHIPPING);
      orderRepo.save(orderEntity);
    }
  }

  public void returnOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    OrderStatus status = orderEntity.getStatus();
    if (status == OrderStatus.SHIPPING) {
      orderEntity.setStatus(OrderStatus.RETURNING);
      orderRepo.save(orderEntity);
    }
  }

  public void comfirmReturnedOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    OrderStatus status = orderEntity.getStatus();
    if (status == OrderStatus.RETURNING) {
      orderEntity.setStatus(OrderStatus.RETURNED);
      orderRepo.save(orderEntity);
    }
  }

  public void successOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    OrderStatus status = orderEntity.getStatus();

    if (orderEntity.getPayment() == null || orderEntity.getPayment().getPaymentAmount() == null) {
      throw new RuntimeException("Vui lòng thanh toán đơn hàng trước khi hoàn tất");
    }

    if (status == OrderStatus.SHIPPING) {
      orderEntity.setStatus(OrderStatus.SUCCESS);
    }
    orderRepo.save(orderEntity);
  }

  public OrderEntity findOrderEntity(UUID orderUUID) {
    OrderEntity orderEntity = orderRepo.findById(orderUUID).orElseThrow(() -> new RuntimeException("Entity not found"));
    return orderEntity;
  }

  public OrderResponse getOrder(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    return OrderResponse.fromEntity(orderEntity);
  }

  /**
   * Lấy danh sách orders theo status với phân trang và sắp xếp
   * 
   * @param status OrderStatus cần lọc
   * @param page   Số trang (bắt đầu từ 0)
   * @param size   Số lượng items mỗi trang
   * @param sort   String format: "fieldName,direction" (ví dụ: "createdAt,DESC")
   * @return PageResponse chứa danh sách OrderResponse
   */
  @Transactional(readOnly = true)
  public Page<OrderResponse> getOrders(
      OrderStatus status,
      UUID customerUUID,
      int page,
      int size,
      String sort) {

    Pageable pageable = createPageable(page, size, sort);

    // Build specification based on provided filters
    Specification<OrderEntity> spec = OrderSpecification.filterOrders(status, customerUUID);

    Page<OrderEntity> orderPage = orderRepo.findAll(spec, pageable);

    return orderPage.map(OrderResponse::fromEntity);
  }

  public List<OrderResponse> getOrdersByCustomerUUID(UUID customerUUID) {
    List<OrderEntity> orders = orderRepo.findAllByCustomerUUIDOrNull(customerUUID);
    return orders.stream().map(OrderResponse::fromEntity).toList();
  }

  private Pageable createPageable(int page, int size, String sort) {
    if (sort == null || sort.trim().isEmpty()) {
      return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    String[] sortParams = sort.split(",");
    if (sortParams.length != 2) {
      throw new IllegalArgumentException(
          "Invalid sort format. Expected: 'fieldName,direction' (e.g., 'createdAt,DESC')");
    }

    String fieldName = sortParams[0].trim();
    String direction = sortParams[1].trim().toUpperCase();

    // Validate direction
    if (!direction.equals("ASC") && !direction.equals("DESC")) {
      throw new IllegalArgumentException(
          "Invalid sort direction: " + direction + ". Use 'ASC' or 'DESC'");
    }

    // Validate field name (optional but recommended)
    validateSortField(fieldName);

    Sort.Direction sortDirection = Sort.Direction.fromString(direction);

    Integer safePage = page;
    if (safePage == null || safePage < 0) {
      safePage = 0;
    }

    Integer safeSize = size;
    if (safeSize == null || safeSize < 1) {
      safeSize = 10;
    }

    return PageRequest.of(safePage, safeSize, Sort.by(sortDirection, fieldName));
  }

  private void validateSortField(String fieldName) {
    List<String> validFields = List.of(
        "uuid", "createdAt", "status", "totalAmount",
        "paymentMethod", "customerUUID");

    if (!validFields.contains(fieldName)) {
      throw new IllegalArgumentException(
          "Invalid sort field: " + fieldName +
              ". Valid fields: " + String.join(", ", validFields));
    }
  }

  // dat thu tien

  public void xacNhanDaThuTien(UUID orderUUID) {
    OrderEntity orderEntity = findOrderEntity(orderUUID);
    if (orderEntity.getPayment() == null) {
      PaymentEntity paymentEntity = new PaymentEntity();
      paymentEntity.setPaymentAmount(orderEntity.getTotalAmount());
      paymentEntity.setOrder(orderEntity);
      orderEntity.setPayment(paymentEntity);
    }

    orderRepo.save(orderEntity);
  }

  // #region statistics
  public List<OrderStatusCount> getOrderStatusStatistics() {
    return orderRepo.countOrdersByStatusJPQL();
  }

  public List<OrderStatisticDTO> getStatistics(LocalDate dateA, LocalDate dateB) {
    // 1. Chuẩn bị tham số LocalDateTime cho truy vấn
    LocalDateTime startDate = dateA.atStartOfDay(); // 00:00:00 của ngày A
    LocalDateTime endDate = dateB.plusDays(1).atStartOfDay(); // 00:00:00 của ngày B+1

    // 2. Gọi truy vấn
    List<Object[]> results = orderRepo.getDailyOrderStatisticsNative(startDate, endDate);

    // 3. Ánh xạ kết quả
    return results.stream()
        .map(row -> {
          // Thứ tự các cột: Ngay, TongSoDonHang, TongTienTatCaDon, TongTienThuDuoc

          // Cột 0: Ngay (có thể là java.sql.Date nếu dùng native query)
          LocalDate date = ((java.sql.Date) row[0]).toLocalDate();

          // Cột 1: TongSoDonHang (Long)
          Long totalOrders = ((Number) row[1]).longValue();

          // Cột 2: TongTienTatCaDon (Long)
          Long totalAmount = ((Number) row[2]).longValue();

          // Cột 3: TongTienThuDuoc (Long)
          Long totalSuccessAmount = ((Number) row[3]).longValue();

          return new OrderStatisticDTO(date, totalOrders, totalAmount, totalSuccessAmount);
        })
        .collect(Collectors.toList());
  }

  // #endregion

}