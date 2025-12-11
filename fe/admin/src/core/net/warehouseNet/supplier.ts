import { PageData, QueryDataFilter } from "@/core/data/commonData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { SupplierData } from "@data/warehouseData";

export class SupplierAPI {
  static prefix: string = "/warehouse/suppliers";

  static async createSupplier(
    name: string,
    contactInfo: string,
    address: string
  ): Promise<SupplierData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          name,
          "contact-info": contactInfo,
          address,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: SupplierData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getSupplier(uuid: string): Promise<SupplierData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: SupplierData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getSuppliers({
    page,
    size,
    sort,
    search,
  }: QueryDataFilter): Promise<PageData<SupplierData>> {
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

  static async updateSupplierName(uuid: string, name: string): Promise<void> {
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

  static async updateSupplierWardCode(
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

  static async updateSupplierAddress(
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

  static async deleteSupplier(uuid: string): Promise<void> {
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

  static async checkSupplierName(name: string): Promise<boolean> {
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
