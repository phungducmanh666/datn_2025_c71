package services.product.api.mapper;

import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.model.database.BrandData;

public class BrandRowMapper {
  public static final BiFunction<Row, RowMetadata, BrandData> MAP = (row, meta) -> new BrandData(
      row.get("uuid", UUID.class),
      row.get("name", String.class),
      row.get("photo_url", String.class));
}
