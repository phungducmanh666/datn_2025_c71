package services.product.api.mapper;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.eum.EProductStatus;
import services.product.core.model.database.ProductData;

public class ProductRowMapper {
  public static final BiFunction<Row, RowMetadata, ProductData> MAP = (row, meta) -> {
    UUID uuid = row.get("uuid", UUID.class);
    String name = row.get("name", String.class);
    String photoUrl = row.get("photo_url", String.class);
    String statusStr = row.get("status", String.class);
    BigDecimal unitPrice = row.get("unit_price", BigDecimal.class);

    EProductStatus status = statusStr != null
        ? EProductStatus.valueOf(statusStr)
        : EProductStatus.DRAFT; // hoặc default nào bạn thích

    return ProductData.builder()
        .uuid(uuid)
        .name(name)
        .photoUrl(photoUrl)
        .status(status)
        .price(unitPrice)
        .build();
  };
}
