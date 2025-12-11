import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { PageData, QueryDataFilter } from "@data/commonData";
import { CustomerData } from "@data/userData";

export class CustomerAPI {
  static prefix: string = "/user/customers";

  static async createCustomer({
    firstName,
    lastName,
    gender,
    birthDate,
    phoneNumber,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    phoneNumber: string;
    email: string;
    password: string;
  }): Promise<CustomerData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          "first-name": firstName,
          "last-name": lastName,
          gender,
          "birth-date": birthDate,
          "phone-number": phoneNumber,
          email,
          password,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: CustomerData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getCustomer(uuid?: string): Promise<CustomerData> {
    if (!!!uuid) return Promise.reject();
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: CustomerData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getCustomers({
    page,
    size,
    sort,
    search,
  }: QueryDataFilter): Promise<PageData<CustomerData>> {
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
        .map((line) => JSON.parse(line) as CustomerData);

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

  static async deleteCustomer(uuid: string): Promise<void> {
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

  //#region  statistics
  static async getCountStatistics(): Promise<number> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/count-statistics`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data = await res.text();
      return Number.parseInt(data);
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }
  //#endregion
}
