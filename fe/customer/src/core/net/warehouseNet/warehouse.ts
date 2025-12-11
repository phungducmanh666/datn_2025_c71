import { PageData, QueryDataFilter } from "@/core/data/commonData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { WarehouseData } from "@data/warehouseData";

export class WarehouseAPI {
  static prefix: string = "/warehouse/warehouses";

  static async createWarehouse(
    name: string,
    wardCode: string,
    address: string
  ): Promise<WarehouseData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          name,
          "ward-code": wardCode,
          address,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: WarehouseData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getWarehouse(uuid: string): Promise<WarehouseData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: WarehouseData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getWarehouses({
    page,
    size,
    sort,
    search,
  }: QueryDataFilter): Promise<PageData<WarehouseData>> {
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

      console.log(res.headers.get("X-Total-Items"));

      // Lấy text NDJSON
      const text = await res.text();

      // Chia từng dòng JSON, lọc rỗng, parse
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as WarehouseData);

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

  static async updateWarehouseName(uuid: string, name: string): Promise<void> {
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

  static async updateWarehouseWardCode(
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

  static async updateWarehouseAddress(
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

  static async deleteWarehouse(uuid: string): Promise<void> {
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

  static async checkWarehouseName(name: string): Promise<boolean> {
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
}
