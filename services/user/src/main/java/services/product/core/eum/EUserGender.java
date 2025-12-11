package services.product.core.eum;

public enum EUserGender {
  MALE("Nam"),
  FEMAL("Nữ"),
  OTHER("Khác");

  private final String value;

  EUserGender(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
