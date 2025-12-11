import { PageData, QueryDataFilter } from "@/core/data/commonData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import {
  PurchaseOrderData,
  PurchaseOrderReceiptData,
} from "@data/warehouseData";

export class PurchaseOrderAPI {
  static prefix: string = "/warehouse/purchase-orders";

  //#region purchase order

  static async createPurchaseOrder(
    supplierUUID: string,
    note: string,
    items: { productUUID: string; quantity: number }[]
  ): Promise<PurchaseOrderData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ supplierUUID, note, items }),
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: PurchaseOrderData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getPurchaseOrder(uuid: string): Promise<PurchaseOrderData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: PurchaseOrderData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getPurchaseOrders({
    page,
    size,
    sort,
    search,
  }: QueryDataFilter): Promise<PageData<PurchaseOrderData>> {
    try {
      const params: Record<string, string | number> = {};
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      if (sort) params.sort = sort;
      if (search) params.search = search;

      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "GET",
        params,
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      // Parse JSON response từ Spring Data Page
      const pageResponse = await res.json();

      return {
        page: pageResponse.number, // Current page number
        size: pageResponse.size, // Page size
        total: pageResponse.totalElements, // Total items
        items: pageResponse.content, // Array of items
      };
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async updatePurchaseOrderName(
    uuid: string,
    name: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/name`, {
        method: "PATCH",
        params: { name },
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

  static async updatePurchaseOrderWardCode(
    uuid: string,
    wardCode: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/ward-code`, {
        method: "PATCH",
        params: { "ward-code": wardCode },
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

  static async updatePurchaseOrderAddress(
    uuid: string,
    address: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/address`, {
        method: "PATCH",
        params: { address },
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

  static async deletePurchaseOrder(uuid: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "DELETE",
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

  static async checkPurchaseOrderName(name: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/check-name`, {
        method: "GET",
        params: {
          name,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: boolean = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  //#endregion

  //#region purchase order receipt
  static async createPurchaseOrderReceipt(
    purchaseOrderUUID: string,
    note: string | undefined,
    items: { productUUID: string; number: number }[]
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${purchaseOrderUUID}/recipts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ note, items }),
        }
      );

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

  static async getPurchaseOrderReceipts(
    purchaseOrderUUID: string
  ): Promise<PurchaseOrderReceiptData[]> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${purchaseOrderUUID}/receipts`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      // Lấy text NDJSON
      const text = await res.text();

      // Chia từng dòng JSON, lọc rỗng, parse
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as PurchaseOrderReceiptData);

      return items;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }
  //#endregion
}
