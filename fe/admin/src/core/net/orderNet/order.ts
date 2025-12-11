import { PageData, QueryDataFilter } from "@/core/data/commonData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import {
  CreateOrderRequest,
  OrderData,
  OrderStatisticData,
  OrderStatus,
} from "@data/orderData";
import { StatusStatisticsData } from "@data/productData";

import dayjs from "dayjs";

export type OrderStatusPath =
  | "comfirm"
  | "cancle"
  | "shipping"
  | "return"
  | "returned"
  | "da-thu-tien"
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
    customerUUID?: string,
    filter: QueryDataFilter = {}
  ): Promise<PageData<OrderData>> {
    try {
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

  //#endregion

  //#region statistics
  static async getStatusStatistics(): Promise<StatusStatisticsData[]> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/status-statistics`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const items = res.json();

      return items;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async getOrderStatistics(
    startDate: string | Date,
    endDate: string | Date
  ): Promise<OrderStatisticData[]> {
    try {
      // 3. Gọi API

      // 1. CHUẨN HÓA DỮ LIỆU
      const formattedStart = dayjs(startDate).format("YYYY-MM-DD");
      const formattedEnd = dayjs(endDate).format("YYYY-MM-DD");
      const res = await fetchWithAuth(`${this.prefix}/statistics`, {
        method: "GET",
        params: {
          start: formattedStart,
          end: formattedEnd,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const items: OrderStatisticData[] = await res.json();

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
