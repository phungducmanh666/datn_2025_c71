package services.product.core.model.database;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.product.core.eum.EProductStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductStatusStatisticData {
    private EProductStatus status;
    private Long number;
}
