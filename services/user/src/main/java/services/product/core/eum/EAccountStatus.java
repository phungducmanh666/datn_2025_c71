package services.product.core.eum;

public enum EAccountStatus {
  DISABLED("khóa"),
  ACTIVE("hoạt động");

  private final String value;

  EAccountStatus(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
