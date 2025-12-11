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
          "redirect-url": `http://localhost:4000/payment-redirect/${orderUUID}`,
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

  //#endregion
}
