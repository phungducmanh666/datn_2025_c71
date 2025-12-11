package services.product.api.mapper;

import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.eum.EProductStatus;
import services.product.core.model.database.ProductStatusStatisticData;

public class ProductStatusStatisticsRowMapper {
  public static final BiFunction<Row, RowMetadata, ProductStatusStatisticData> MAP = (row, meta) -> {

    String statusStr = row.get("status", String.class);
    EProductStatus status = statusStr != null
        ? EProductStatus.valueOf(statusStr)
        : EProductStatus.DRAFT;

    Long number = row.get("total_count", Long.class);

    return ProductStatusStatisticData.builder()
        .status(status)
        .number(number)
        .build();
  };
}
