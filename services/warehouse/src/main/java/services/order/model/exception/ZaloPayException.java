package services.order.model.exception;

public class ZaloPayException extends RuntimeException {
  public ZaloPayException(String message) {
    super(message);
  }

  public ZaloPayException(String message, Throwable cause) {
    super(message, cause);
  }
}
