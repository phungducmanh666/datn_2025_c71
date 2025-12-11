package services.order.service;

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import services.order.model.entity.OrderLineEntity;
import services.order.model.entity.PurchaseOrderEntity;
import services.order.model.entity.ReciptEntity;
import services.order.model.entity.StockEntity;
import services.order.model.entity.SupplierEntity;
import services.order.model.request.CreateOrderDTO;
import services.order.model.request.CreateOrderItemDTO;
import services.order.model.request.CreateReceiptDTO;
import services.order.model.request.CreateReceiptItemDTO;
import services.order.model.response.OrderDTO;
import services.order.repo.OrderRepo;
import services.order.repo.StockRepo;

@Service
@RequiredArgsConstructor
public class OrderService {

  private final OrderRepo orderRepo;
  private final StockRepo stockRepo;
  private final StockService stockService;
  private final SupplierService supplierService;

  public OrderDTO createOrder(CreateOrderDTO data, UUID staffUUID) {
    PurchaseOrderEntity orderEntity = new PurchaseOrderEntity();
    SupplierEntity supplierEntity = supplierService.findSupplier(data.getSupplierUUID());

    orderEntity.setStaffUUID(staffUUID);
    orderEntity.setSupplier(supplierEntity);
    orderEntity.setNote(data.getNote());
    List<OrderLineEntity> items = new LinkedList<>();
    for (CreateOrderItemDTO item : data.getItems()) {
      OrderLineEntity orderLineEntity = OrderLineEntity.builder()
          .productUUID(item.getProductUUID())
          .orderNumber(item.getQuantity())
          .receiptNumber(0)
          .purchaseOrder(orderEntity)
          .build();
      items.add(orderLineEntity);
    }
    orderEntity.setItems(items);

    return OrderDTO.fromEntity(orderRepo.save(orderEntity));
  }

  public Page<OrderDTO> getOrders(Integer page, Integer size, String sort) {
    int currentPage = (page != null) ? page : 0;
    int pageSize = (size != null) ? size : Integer.MAX_VALUE;

    PageRequest pageRequest = createPageRequest(currentPage, pageSize, sort);
    return orderRepo.findAll(pageRequest).map(OrderDTO::fromEntity);
  }

  private PageRequest createPageRequest(int page, int size, String sort) {
    if (sort == null || sort.trim().isEmpty()) {
      return PageRequest.of(page, size);
    }

    String[] sortParts = sort.split(",");
    String sortField = "createdAt";
    Sort.Direction direction = Sort.Direction.DESC;

    try {
      sortField = sortParts[0].trim();
    } catch (Exception e) {
    }

    if (sortParts.length > 1) {
      try {
        direction = Sort.Direction.fromString(sortParts[1].trim().toUpperCase());
      } catch (IllegalArgumentException e) {
        // Giữ mặc định ASC nếu direction không hợp lệ
      }
    }
    return PageRequest.of(page, size, Sort.by(direction, sortField));
  }

  public PurchaseOrderEntity findOrder(UUID uuid) {
    return orderRepo.findById(uuid).orElseThrow(() -> new RuntimeException("Not found entity"));
  }

  public OrderDTO getOrder(UUID uuid) {
    return OrderDTO.fromEntity(findOrder(uuid));
  }

  @Transactional
  public void reciptOrder(UUID orderUUID, CreateReceiptDTO data) {
    PurchaseOrderEntity orderEntity = findOrder(orderUUID);

    ReciptEntity reciptEntity = new ReciptEntity();
    reciptEntity.setNote(data.getNote());
    reciptEntity.setPurchaseOrder(orderEntity);
    orderEntity.setRecipt(reciptEntity);

    for (CreateReceiptItemDTO item : data.getItems()) {
      for (int i = 0; i < orderEntity.getItems().size(); i++) {
        OrderLineEntity orderLineEntity = orderEntity.getItems().get(i);
        if (item.getProductUUID().equals(orderLineEntity.getProductUUID())) {
          orderLineEntity.setReceiptNumber(item.getNumber());
          StockEntity stockEntity = null;
          try {
            stockEntity = stockService.findStockEntity(item.getProductUUID());
          } catch (Exception e) {
            stockEntity = StockEntity.builder()
                .productUUID(item.getProductUUID())
                .number(0)
                .build();
          }
          stockEntity.setNumber(
              stockEntity.getNumber() + item.getNumber());
          stockRepo.save(stockEntity);
        }
      }
    }

    orderRepo.save(orderEntity);
  }

}
