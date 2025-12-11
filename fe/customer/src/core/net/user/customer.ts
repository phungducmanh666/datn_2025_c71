import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { PageData, QueryDataFilter } from "@data/commonData";
import { CustomerData } from "@data/userData";
import { ImageApi } from "@net/imageNet/image";

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

  static async checkEmailUsaged(email: string): Promise<boolean> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/check-name`, {
        method: "GET",
        params: {
          email,
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

  static async updateFirstName(uuid: string, firstName: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/first-name`, {
        method: "PATCH",
        params: { "first-name": firstName },
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

  static async updateLastName(uuid: string, value: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/last-name`, {
        method: "PATCH",
        params: { "last-name": value },
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

  static async updateAddress(uuid: string, value: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/address`, {
        method: "PATCH",
        params: { address: value },
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

  static async updateGender(
    uuid: string,
    value: "MALE" | "FEMAL" | "OTHER"
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/gender`, {
        method: "PATCH",
        params: { gender: value },
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

  static async updateBirthDate(uuid: string, value: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/birth-date`, {
        method: "PATCH",
        params: { "birth-date": value },
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

  static async updatePhoneNumber(uuid: string, value: string): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/phone-number`, {
        method: "PATCH",
        params: { "phone-number": value },
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

  static async updatePhoto(uuid: string, photo?: File): Promise<void> {
    try {
      let url = null;

      if (photo) {
        url = await ImageApi.uploadImage(photo);
      }

      const params: Record<string, string | number | boolean> = {
        ...(url ? { "photo-url": url } : {}),
      };

      const res = await fetchWithAuth(`${this.prefix}/${uuid}/photo-url`, {
        method: "PATCH",
        params,
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
