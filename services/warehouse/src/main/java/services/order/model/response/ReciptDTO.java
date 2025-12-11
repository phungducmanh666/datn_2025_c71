package services.order.model.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.order.model.entity.ReciptEntity;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReciptDTO {
  private UUID uuid;
  private String note;
  private UUID staffUUID;
  private LocalDateTime createdAt;

  public static ReciptDTO fromEntity(ReciptEntity entity) {
    return entity == null ? null
        : ReciptDTO.builder()
            .uuid(entity.getUuid())
            .note(entity.getNote())
            // .staffUUID(entity.getStaffUUID())
            .createdAt(entity.getCreatedAt())
            .build();
  }
}
