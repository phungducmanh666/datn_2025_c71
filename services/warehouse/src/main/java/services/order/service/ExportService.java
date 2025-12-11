package services.order.service;

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import services.order.model.entity.ExportEntity;
import services.order.model.entity.ExportItemEntity;
import services.order.model.entity.StockEntity;
import services.order.model.kafka.KafkaOrderDTO;
import services.order.repo.ExportRepo;
import services.order.repo.StockRepo;

@Service
@RequiredArgsConstructor
public class ExportService {

  private final ExportRepo exportRepo;
  private final StockRepo stockRepo;
  private final StockService stockService;

  @Transactional
  public void createExport(KafkaOrderDTO data) {
    try {
      findByOrderUUID(data.getOrderUUID());
      throw new RuntimeException("Export already exists");
    } catch (Exception e) {
    }

    ExportEntity exportEntity = new ExportEntity();
    exportEntity.setOrderUUID(data.getOrderUUID());

    List<ExportItemEntity> items = new LinkedList<>();
    for (KafkaOrderDTO.OrderLineDto item : data.getItems()) {
      StockEntity stockEntity = stockService.findStockEntity(item.getProductUUID());

      if (stockEntity.getNumber() < item.getNumber()) {
        throw new RuntimeException("Số lượng hàng hóa không đủ.");
      }

      ExportItemEntity itemEntity = new ExportItemEntity();

      itemEntity.setExport(exportEntity);
      itemEntity.setProductUUID(item.getProductUUID());
      itemEntity.setNumber(item.getNumber());
      items.add(itemEntity);

      stockEntity.setNumber(stockEntity.getNumber() - item.getNumber());
      stockRepo.save(stockEntity);
    }

    exportEntity.setItems(items);
    exportRepo.save(exportEntity);
  }

  public ExportEntity findByOrderUUID(UUID orderUUID) {
    return exportRepo.findById(orderUUID).orElseThrow(() -> new RuntimeException("Not found entity"));
  }

}
