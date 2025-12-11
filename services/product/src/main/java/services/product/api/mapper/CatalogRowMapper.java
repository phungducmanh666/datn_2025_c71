package services.product.api.mapper;

import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.model.database.CatalogData;

public class CatalogRowMapper {
  public static final BiFunction<Row, RowMetadata, CatalogData> MAP = (row, meta) -> new CatalogData(
      row.get("uuid", UUID.class),
      row.get("name", String.class),
      row.get("photo_url", String.class));
}
