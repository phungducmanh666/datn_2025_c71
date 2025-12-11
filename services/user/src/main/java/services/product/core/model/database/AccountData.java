package services.product.core.model.database;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.product.core.eum.EAccountStatus;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class AccountData {
  private String username;
  private String password;
  private EAccountStatus status;
  private UUID staffUUID;
  private UUID customerUUID;
}
