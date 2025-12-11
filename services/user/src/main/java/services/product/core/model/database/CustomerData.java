package services.product.core.model.database;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import services.product.core.eum.EUserGender;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class CustomerData {
  private UUID uuid;
  private String firstName;
  private String lastName;
  private LocalDateTime birthDate;
  private EUserGender gender;
  private String phoneNumber;
  private String email;
  private String photoUrl;
  private String address;
}
