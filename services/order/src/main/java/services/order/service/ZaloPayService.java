package services.order.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import services.order.feign.ZaloPayClient;
import services.order.model.constant.PaymentMethod;
import services.order.model.constant.ZaloPayConstants;
import services.order.model.entity.OrderEntity;
import services.order.model.entity.PaymentEntity;
import services.order.model.entity.RefundEntity;
import services.order.model.exception.OrderNotFoundException;
import services.order.model.exception.PaymentNotAllowedException;
import services.order.model.exception.ZaloPayException;
import services.order.model.request.ZaloPayOrderRequest;
import services.order.model.response.ZaloPayCheckOrderResponse;
import services.order.model.response.ZaloPayOrderResponse;
import services.order.model.response.ZaloPayRefundResponse;
import services.order.model.response.ZaloPayResponse;
import services.order.repo.OrderRepo;
import services.order.util.ZaloPayParamsBuilder;
import services.order.util.ZaloPayTransactionIdGenerator;

@Slf4j
@Service
@RequiredArgsConstructor
public class ZaloPayService {

    private final ZaloPayClient zalopayClient;
    private final OrderRepo orderRepository;
    private final ZaloPayTransactionIdGenerator idGenerator;
    private final ZaloPayParamsBuilder paramsBuilder;

    @Transactional
    public ZaloPayOrderResponse createOrder(UUID orderUid, String redirectUrl) {
        log.info("Creating ZaloPay order for orderUid: {}", orderUid);

        OrderEntity order = getOrderOrThrow(orderUid);
        Long amount = calculateTotalAmount(order);
        String appTransId = idGenerator.generateAppTransId();

        PaymentEntity paymentEntity = new PaymentEntity();
        paymentEntity.setCreatedAt(LocalDateTime.now());
        paymentEntity.setOrder(order);
        paymentEntity.setApptransid(appTransId);
        order.setPayment(paymentEntity);

        orderRepository.save(order);

        // Build request
        ZaloPayOrderRequest request = ZaloPayOrderRequest.builder()
                .appTransId(appTransId)
                .amount(amount)
                .description(orderUid.toString())
                .redirectUrl(redirectUrl)
                .appUser(ZaloPayConstants.DEFAULT_APP_USER)
                .bankCode(ZaloPayConstants.DEFAULT_BANK_CODE)
                .build();

        Map<String, String> params = paramsBuilder.buildCreateOrderParams(request);
        Map<String, Object> response = zalopayClient.createOrder(params);

        return ZaloPayOrderResponse.builder()
                .returnCode((Integer) response.get("returncode"))
                .returnMessage((String) response.get("returnmessage"))
                .orderUrl((String) response.get("orderurl"))
                .zpTransToken((String) response.get("zptranstoken"))
                .paymentAmount((Long) response.get("amount"))
                .discountAmount((Long) response.get("discountamount"))
                .type(2)
                .build();
    }

    public ZaloPayCheckOrderResponse checkOrder(String appTransId) {
        log.info("Checking ZaloPay order status for appTransId: {}", appTransId);

        Map<String, String> params = paramsBuilder.buildCheckOrderParams(appTransId);
        Map<String, Object> response = zalopayClient.checkOrder(params);

        System.out.println(response.toString());

        return ZaloPayCheckOrderResponse.builder()
                .returnCode((Integer) response.get("returncode"))
                .returnMessage((String) response.get("returnmessage"))
                .isProcessing((Boolean) response.get("isprocessing"))
                .paymentAmount(((Integer) response.get("amount")).longValue())
                .discountAmount(((Integer) response.get("discountamount")).longValue())
                .zptransid(((Long) response.get("zptransid")))
                .build();
    }

    @Transactional
    public ZaloPayResponse processPayment(UUID orderUid, String redirectUrl) {
        log.info("Processing payment for orderUid: {}", orderUid);

        OrderEntity order = getOrderOrThrow(orderUid);

        // Check if already paid
        if (order.getPayment() != null && order.getPayment().getApptransid() != null) {
            ZaloPayCheckOrderResponse existingPayment = checkExistingPayment(order);
            if (existingPayment != null) {
                return existingPayment;
            }
        }

        // Create new payment
        return createOrder(orderUid, redirectUrl);
    }

    @Transactional
    public ZaloPayRefundResponse refundOrder(UUID orderUid) {
        log.info("Refunding order: {}", orderUid);

        OrderEntity order = getOrderOrThrow(orderUid);
        validateRefundEligibility(order);

        Long refundAmount = calculateRefundAmount(order);
        String description = String.format(
                ZaloPayConstants.REFUND_MESSAGE_TEMPLATE,
                orderUid.toString());

        Map<String, String> params = paramsBuilder.buildRefundParams(
                order.getPayment().getZptransid(),
                refundAmount,
                description);

        Map<String, Object> response = zalopayClient.refundOrder(params);

        updateOrderRefundStatus(order, response, refundAmount);

        return ZaloPayRefundResponse.builder()
                .returnCode((Integer) response.get("returncode"))
                .returnMessage((String) response.get("returnmessage"))
                .refundId(String.valueOf(response.get("refundid")))
                .build();
    }

    public Map<String, Object> checkRefundStatus(UUID orderUid) {
        OrderEntity order = getOrderOrThrow(orderUid);

        if (order.getRefund().getZprefundsid() == null) {
            throw new PaymentNotAllowedException("Order does not have refund transaction ID");
        }

        Map<String, String> params = paramsBuilder.buildCheckRefundParams(order.getRefund().getZprefundsid());

        System.out.println(String.format("""


                CHECK REFUND PARAMS: %s


                        """, params.toString()));

        Map<String, Object> response = zalopayClient.checkRefundOrder(params);

        Integer returnCode = (Integer) response.get("returncode");
        if (returnCode == null) {
            throw new ZaloPayException("No return code received from ZaloPay");
        }

        return response;
    }

    // ============ Private Helper Methods ============

    private OrderEntity getOrderOrThrow(UUID orderUid) {
        return orderRepository.findById(orderUid)
                .orElseThrow(() -> new OrderNotFoundException("Order not found: " + orderUid));
    }

    private Long calculateTotalAmount(OrderEntity order) {
        Long amount = order.getTotalAmount() - order.getTotalSaved();
        return amount;
    }

    private Long calculateRefundAmount(OrderEntity order) {
        Long paymentAmount = order.getPayment().getPaymentAmount();
        Long discountAmount = order.getPayment().getDiscountAmount();

        if (paymentAmount == null || discountAmount == null) {
            throw new PaymentNotAllowedException("Invalid refund amount");
        }

        return paymentAmount - discountAmount;
    }

    private ZaloPayCheckOrderResponse checkExistingPayment(OrderEntity order) {
        try {
            ZaloPayCheckOrderResponse checkResponse = checkOrder(order.getPayment().getApptransid());

            if (checkResponse.getReturnCode() == ZaloPayConstants.RETURN_CODE_SUCCESS) {
                updateOrderAsPaid(order, checkResponse);
                return checkResponse;
            }
        } catch (Exception e) {
            log.warn("Failed to check existing payment for order: {}", order.getUuid(), e);
        }

        return null;
    }

    private void updateOrderAsPaid(OrderEntity order, ZaloPayCheckOrderResponse response) {
        order.getPayment().setPaymentAmount(response.getPaymentAmount());
        order.getPayment().setDiscountAmount(response.getDiscountAmount());
        order.getPayment().setZptransid(response.getZptransid());

        // Không cần set draft sang pendding nữa
        // order.setStatus(OrderStatus.PENDING);
        orderRepository.save(order);
    }

    private void validateRefundEligibility(OrderEntity order) {
        if (order.getPaymentMethod() != PaymentMethod.ZALO_PAY) {
            throw new PaymentNotAllowedException("Cannot refund order not paid with ZaloPay");
        }

        if (order.getPayment() == null) {
            throw new PaymentNotAllowedException("Cannot refund unpaid order");
        }

        if (order.getRefund() != null) {
            throw new PaymentNotAllowedException("Order already refunded");
        }
    }

    private void updateOrderRefundStatus(OrderEntity order, Map<String, Object> response, Long refundAmount) {
        String refundId = String.valueOf(response.get("refundid"));
        Integer returnCode = (Integer) response.get("returncode");

        if (returnCode != null && returnCode >= ZaloPayConstants.RETURN_CODE_SUCCESS) {
            RefundEntity refundEntity = new RefundEntity();
            refundEntity.setAmount(refundAmount);
            refundEntity.setZprefundsid(refundId);
            refundEntity.setOrder(order);

            order.setRefund(refundEntity);
        }

        orderRepository.save(order);
    }
}