package services.product.api.mapper;

import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.model.database.AttributeData;

public class AttributeRowMapper {
  public static final BiFunction<Row, RowMetadata, AttributeData> MAP = (row, meta) -> AttributeData.builder()
      .uuid(row.get("uuid", UUID.class))
      .name(row.get("name", String.class))
      .build();
}
