package services.product.core.model.database;

import java.util.LinkedList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AttributeData {
    private UUID uuid;
    private String name;
    @JsonProperty("attribute_values")
    private List<AttributeValueData> values = new LinkedList<>();
}
