package services.product.core.model.database;

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttributeGroupData {
    private UUID uuid;
    private String name;
    private List<AttributeData> attributes = new LinkedList<>();
}
