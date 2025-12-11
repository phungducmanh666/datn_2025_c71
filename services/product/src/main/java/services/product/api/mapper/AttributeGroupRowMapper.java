package services.product.api.mapper;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.model.database.AttributeData;
import services.product.core.model.database.AttributeGroupData;
import services.product.helper.JsonUtils;

public class AttributeGroupRowMapper {
  public static final BiFunction<Row, RowMetadata, AttributeGroupData> MAP = (row, meta) -> new AttributeGroupData(
      row.get("uuid", UUID.class),
      row.get("name", String.class), null);

  public static final BiFunction<Row, RowMetadata, AttributeGroupData> MAP2 = (row, meta) -> {
    UUID uuid = row.get("uuid", UUID.class);
    String name = row.get("name", String.class);
    String attributesJson = row.get("attributes_json", String.class);

    List<AttributeData> attributes = Collections.emptyList();
    if (attributesJson != null && !attributesJson.isEmpty()) {
      try {
        attributes = JsonUtils.parseList(attributesJson, AttributeData.class);
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    return new AttributeGroupData(uuid, name, attributes);
  };
}
