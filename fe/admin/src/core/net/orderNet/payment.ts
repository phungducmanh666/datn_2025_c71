import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { PayForOrderResponse } from "@data/orderData";

export class PaymentAPI {
  static prefix: string = "/order/payments";

  //#region crud
  static async createPaymentOrder(
    orderUUID: string
  ): Promise<PayForOrderResponse> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          "order-uuid": orderUUID,
          "redirect-url": `http://localhost:3000/payment-redirect/${orderUUID}`,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: PayForOrderResponse = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async refundOrder(orderUUID: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          "order-uuid": orderUUID,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  //#endregion
}
