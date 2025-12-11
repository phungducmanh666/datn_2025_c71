package services.product.core.eum;

public enum EProductStatus {
    DRAFT("Nháp"),
    ACTIVE("Đang kinh doanh"),
    INACTIVE("Ngừng kinh doanh"),
    HIDE("Ẩn đi");

    private final String value;

    EProductStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
