package services.product.helper;

import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtils {
  private static final ObjectMapper objectMapper = new ObjectMapper();

  public static <T> List<T> parseJson(String json, Class<T> clazz) {
    try {
      return objectMapper.readValue(json, new TypeReference<List<T>>() {
      });
    } catch (Exception e) {
      throw new RuntimeException("Lỗi parse JSON", e);
    }
  }

  public static <T> List<T> parseList(String json, Class<T> clazz) {
    try {
      return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
    } catch (Exception e) {
      e.printStackTrace();
      return Collections.emptyList();
    }
  }
}
