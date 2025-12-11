package services.product.core.model.database;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.product.core.eum.EProductStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductData {
    private UUID uuid;
    private String name;
    private String photoUrl;
    private EProductStatus status;
    private BigDecimal price;
    private List<ProductImageData> images;
}
