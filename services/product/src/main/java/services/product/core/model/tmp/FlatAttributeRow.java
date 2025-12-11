package services.product.core.model.tmp;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FlatAttributeRow {
  private UUID groupUuid;
  private String groupName;
  private UUID attrUuid;
  private String attrName;
  private UUID valueUuid;
  private String valueText;
}
