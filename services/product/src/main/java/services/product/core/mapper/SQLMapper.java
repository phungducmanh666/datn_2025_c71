package services.product.core.mapper;

import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;

public class SQLMapper {

  public static final BiFunction<Row, RowMetadata, Long> CNT_MAPPER = (row, meta) -> row.get("cnt", Long.class);
  public static final BiFunction<Row, RowMetadata, Boolean> EXISTS_MAPPER = (row,
      meta) -> row.get("exists_flag", Integer.class) == 1;
}
