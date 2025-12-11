package services.order.model.exception;

public class OrderNotFoundException extends ZaloPayException {
  public OrderNotFoundException(String message) {
    super(message);
  }
}
