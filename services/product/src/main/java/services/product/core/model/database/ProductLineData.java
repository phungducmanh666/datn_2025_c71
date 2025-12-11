package services.product.core.model.database;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductLineData {
    private UUID uuid;
    private String name;
    private Boolean isDefault;
}
