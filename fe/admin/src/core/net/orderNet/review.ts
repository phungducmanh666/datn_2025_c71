import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { ReviewData } from "@data/orderData";

export class ReviewAPI {
  static prefix: string = "/order/reviews";
  //#region crud

  static async getReviews(productUUID: string): Promise<ReviewData[]> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "GET",
        params: {
          "product-uuid": productUUID,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: ReviewData[] = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async createReview(
    orderLineUUID: string,
    content: string,
    star: number
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        params: {
          "order-line-uuid": orderLineUUID,
          content,
          star,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }
}
