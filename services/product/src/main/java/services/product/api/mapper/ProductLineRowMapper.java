package services.product.api.mapper;

import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.model.database.ProductLineData;

public class ProductLineRowMapper {
  public static final BiFunction<Row, RowMetadata, ProductLineData> MAP = (row, meta) -> new ProductLineData(
      row.get("uuid", UUID.class),
      row.get("name", String.class),
      row.get("is_default", Boolean.class));
}
