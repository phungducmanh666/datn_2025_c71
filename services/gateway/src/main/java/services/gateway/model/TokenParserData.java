package services.gateway.model;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TokenParserData {
  private UUID userUUID;
  private String firstName;
  private String lastName;
  private EUserGender gender;
  private LocalDateTime birthDate;
  private String phoneNumber;
  private String email;
  private String username;
  private EAccountReferenceType type;

  private List<String> roles;
  private List<String> permissions;
}

