import { getToastApi } from "@context/toastContext";
import { PaymentAPI } from "@net/orderNet/payment";
import { useMutation } from "@tanstack/react-query";

export function useCreatePaymentOrder(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async (orderUUID: string) => {
      return PaymentAPI.createPaymentOrder(orderUUID);
    },
    onSuccess: (result) => {
      console.log(result);
      const { isPaid, orderUrl } = result;
      if (isPaid) {
        onSuccess?.();
        return;
      }
      window.location.href = orderUrl;
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRefundOrder(onSuccess?: () => void) {
  return useMutation({
    mutationFn: async (orderUUID: string) => {
      return PaymentAPI.refundOrder(orderUUID);
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
