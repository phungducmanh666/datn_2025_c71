package services.product.helper;

public class Convertor {
  public static Object getValueOrNullEmpty(Object object) {
    if (object == null) {
      return "";
    }
    return object;
  }
}
