import { PageData, QueryDataFilter } from "@/core/data/commonData";
import { AttributeData } from "@/core/data/productData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { CreateOrderRequest, OrderData, OrderStatus } from "@data/orderData";
import { LocalStorageUtil } from "@util/localStorageUtil";

export type OrderStatusPath =
  | "comfirm"
  | "cancle"
  | "shipping"
  | "return"
  | "returned"
  | "success";

export interface SpringPageResponse<T> {
  content: T[];
  number: number; // page number
  size: number; // page size
  totalElements: number;
}

export class OrderAPI {
  static prefix: string = "/order/orders";

  //#region crud

  static async createOrder(orderData: CreateOrderRequest): Promise<OrderData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: OrderData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async updateOrderStatus(
    uuid: string,
    status: OrderStatusPath
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/${status}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  static async getOrder(uuid: string): Promise<OrderData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: OrderData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getOrders(
    status?: OrderStatus,
    filter: QueryDataFilter = {}
  ): Promise<PageData<OrderData>> {
    try {
      const customerUUID = LocalStorageUtil.getCustomer()?.uuid;

      console.log("UUID", customerUUID);

      // 1. Lấy tất cả các filter cần thiết
      const { page, size, sort } = filter;

      // 2. Chuẩn bị tham số URL (params)
      const params: Record<string, string | number> = {};
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      if (sort) params.sort = sort;

      // THÊM CÁC THAM SỐ LỌC CÒN THIẾU
      if (status) params.status = status;
      // Tên tham số phải khớp với backend: name = "customer-uuid"
      if (customerUUID) params["customer-uuid"] = customerUUID;

      // 3. Gọi API
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "GET",
        params, // fetchWithAuth cần xử lý việc biến params thành query string
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const pageData: SpringPageResponse<OrderData> = await res.json();

      return {
        page: pageData.number, // Spring dùng 'number' cho chỉ mục trang
        size: pageData.size,
        total: pageData.totalElements, // Spring dùng 'totalElements' cho tổng số phần tử
        items: pageData.content, // Spring dùng 'content' cho danh sách items
      };
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async updateGroupName(uuid: string, name: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/groups/${uuid}/name`, {
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

  static async deleteGroup(uuid: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/groups/${uuid}`, {
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

  static async checkGroupName(name: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/groups/check-name`, {
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

  //#region attribute
  static async createAttribute(
    groupUUID: string,
    name: string
  ): Promise<AttributeData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          "group-uuid": groupUUID,
          name,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: AttributeData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getAttributes(
    groupUUID: string,
    { page, size, sort, search }: QueryDataFilter
  ): Promise<PageData<AttributeData>> {
    try {
      const params: Record<string, string | number> = {
        "group-uuid": groupUUID,
      };
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

      console.log(res.headers.get("X-Total-Items"));

      // Lấy text NDJSON
      const text = await res.text();

      // Chia từng dòng JSON, lọc rỗng, parse
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as AttributeData);

      const pageHeader = parseInt(res.headers.get("X-Current-Page") || "0", 10);
      const sizeHeader = parseInt(res.headers.get("X-Page-Size") || "0", 10);
      const totalHeader = parseInt(res.headers.get("X-Total-Items") || "0", 10);

      return {
        page: pageHeader,
        size: sizeHeader,
        total: totalHeader,
        items,
      };
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async checkAttributeName(
    groupUUID: string,
    name: string
  ): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/check-name`, {
        method: "GET",
        params: {
          "group-uuid": groupUUID,
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

  static async getAttribute(uuid: string): Promise<AttributeData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: AttributeData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async updateAttributeName(uuid: string, name: string): Promise<void> {
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

  static async deleteAttribute(uuid: string): Promise<void> {
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
  //#endregion
}
