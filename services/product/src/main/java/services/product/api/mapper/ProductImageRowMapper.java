package services.product.api.mapper;

import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.model.database.ProductImageData;

public class ProductImageRowMapper {
  public static final BiFunction<Row, RowMetadata, ProductImageData> MAP = (row, meta) -> new ProductImageData(
      row.get("uuid", UUID.class),
      row.get("photo_url", String.class));
}
