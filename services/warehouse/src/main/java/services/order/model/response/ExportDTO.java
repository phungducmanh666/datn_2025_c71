package services.order.model.response;

import java.time.LocalDateTime;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.ExportEntity;
import services.order.model.entity.ExportItemEntity;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ExportDTO {

  private UUID uuid;
  private UUID orderUUID;
  private LocalDateTime createdAt;
  private List<ExportItemDTO> items;

  public static ExportDTO fromEntity(ExportEntity entity) {

    List<ExportItemDTO> items = new LinkedList<>();
    if (entity.getItems() != null) {
      for (ExportItemEntity item : entity.getItems()) {
        items.add(ExportItemDTO.fromEntity(item));
      }
    }

    return entity == null ? null
        : ExportDTO.builder()
            .orderUUID(entity.getOrderUUID())
            .createdAt(entity.getCreatedAt())
            .items(items)
            .build();
  }

}
