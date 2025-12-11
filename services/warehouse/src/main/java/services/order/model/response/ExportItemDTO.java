package services.order.model.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.ExportItemEntity;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class ExportItemDTO {
  private UUID uuid;
  private UUID productUUID;
  private Integer number;

  public static ExportItemDTO fromEntity(ExportItemEntity entity) {
    return entity == null ? null
        : ExportItemDTO.builder()
            .uuid(entity.getUuid())
            .productUUID(entity.getProductUUID())
            .number(entity.getNumber())
            .build();
  }
}
