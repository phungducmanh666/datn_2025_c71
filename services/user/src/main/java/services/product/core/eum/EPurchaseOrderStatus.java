package services.product.core.eum;

public enum EPurchaseOrderStatus {
  CHUA_NHAP("Chưa nhập"),
  DANG_NHAP("Đang nhập"),
  DA_NHAP_HET("Đã nhập hết");

  private final String value;

  EPurchaseOrderStatus(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}
