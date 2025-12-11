package services.product.api.mapper;

import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.model.database.RoleData;

public class RoleRowMapper {
  public static final BiFunction<Row, RowMetadata, RoleData> MAP = (row, meta) -> {
    return RoleData.builder()
        .uuid(row.get("uuid", UUID.class))
        .name(row.get("name", String.class))
        .description(row.get("description", String.class))
        .build();
  };
}
