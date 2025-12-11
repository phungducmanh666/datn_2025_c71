package services.product.core.eum;

public enum EAccountReferenceType {
  STAFF("Nhân viên"),
  CUSTOMER("Khách hàng");

  private final String value;

  EAccountReferenceType(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
