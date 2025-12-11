package services.order.model.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.SupplierEntity;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class SupplierDTO {
  private UUID uuid;
  private String contactInfo;
  private String address;
  private String name;

  public static SupplierDTO fromEntity(SupplierEntity entity) {
    return entity == null ? null
        : SupplierDTO.builder()
            .uuid(entity.getUuid())
            .name(entity.getName())
            .contactInfo(entity.getContactInfo())
            .address(entity.getAddress())
            .build();
  }
}
