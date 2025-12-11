package services.order.model.exception;

public class PaymentNotAllowedException extends ZaloPayException {
  public PaymentNotAllowedException(String message) {
    super(message);
  }
}
