import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { CartItemData } from "@data/orderData";
import { LocalStorageUtil } from "@util/localStorageUtil";

export class CartAPI {
  static prefix: string = "/order/carts";
  //#region crud

  static async addToCart(productUUID: string): Promise<void> {
    const customer =  LocalStorageUtil.getCustomer();
    if (!customer) {
      return Promise.reject(new Error("Chưa đăng nhập"));
    }

    const customerUUID = customer.uuid;

    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          "customer-uuid": customerUUID,
          "product-uuid": productUUID,
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

  static async getCartItems(): Promise<CartItemData[]> {
    const customer = LocalStorageUtil.getCustomer();
    if (!customer) {
      return Promise.reject(new Error("Chưa đăng nhập"));
    }

    const customerUUID = customer.uuid;

    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "GET",
        params: {
          "customer-uuid": customerUUID,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: CartItemData[] = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async removeCartItem(productUUID: string): Promise<void> {
    try {
      const customer = LocalStorageUtil.getCustomer();
      if (!customer) {
        return Promise.reject(new Error("Chưa đăng nhập"));
      }

      const customerUUID = customer.uuid;

      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "DELETE",
        params: {
          "customer-uuid": customerUUID,
          "product-uuid": productUUID,
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
}
