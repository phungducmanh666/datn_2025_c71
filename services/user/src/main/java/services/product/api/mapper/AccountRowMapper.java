package services.product.api.mapper;

import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.eum.EAccountStatus;
import services.product.core.model.database.AccountData;

public class AccountRowMapper {
  public static final BiFunction<Row, RowMetadata, AccountData> MAP = (row, meta) -> {

    String statusStr = row.get("status", String.class);
    EAccountStatus status = EAccountStatus.valueOf(statusStr);

    return AccountData.builder()
        .staffUUID(row.get("staff_uuid", UUID.class))
        .customerUUID(row.get("customer_uuid", UUID.class))
        .username(row.get("username", String.class))
        .password(row.get("password", String.class))
        .status(status)
        .build();
  };
}
