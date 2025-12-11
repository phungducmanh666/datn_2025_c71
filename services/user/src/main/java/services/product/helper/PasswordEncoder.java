package services.product.helper;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordEncoder {
  public static BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public static String encode(String raw) {
    return encoder.encode(raw);
  }

  public static boolean compare(String raw, String encodeValue) {
    return encoder.matches(raw, encodeValue);
  }
}
