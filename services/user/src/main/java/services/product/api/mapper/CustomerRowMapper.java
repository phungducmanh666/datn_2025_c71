package services.product.api.mapper;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.CustomerData;

public class CustomerRowMapper {
  public static final BiFunction<Row, RowMetadata, CustomerData> MAP = (row, meta) -> {

    String genderStr = row.get("gender", String.class);
    EUserGender gender = EUserGender.valueOf(genderStr);

    return CustomerData.builder()
        .uuid(row.get("uuid", UUID.class))
        .firstName(row.get("first_name", String.class))
        .lastName(row.get("last_name", String.class))
        .phoneNumber(row.get("phone_number", String.class))
        .email(row.get("email", String.class))
        .birthDate(row.get("birth_date", LocalDateTime.class))
        .photoUrl(row.get("photo_url", String.class))
        .address(row.get("address", String.class))
        .gender(gender)
        .build();
  };
}
