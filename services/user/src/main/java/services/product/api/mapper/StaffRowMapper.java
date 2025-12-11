package services.product.api.mapper;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.function.BiFunction;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import services.product.core.eum.EUserGender;
import services.product.core.model.database.StaffData;

public class StaffRowMapper {
  public static final BiFunction<Row, RowMetadata, StaffData> MAP = (row, meta) -> {

    String genderStr = row.get("gender", String.class);
    EUserGender gender = EUserGender.valueOf(genderStr);

    return StaffData.builder()
        .uuid(row.get("uuid", UUID.class))
        .code(row.get("code", String.class))
        .firstName(row.get("first_name", String.class))
        .lastName(row.get("last_name", String.class))
        .phoneNumber(row.get("phone_number", String.class))
        .email(row.get("email", String.class))
        .birthDate(row.get("birth_date", LocalDateTime.class))
        .gender(gender)
        .build();
  };
}
