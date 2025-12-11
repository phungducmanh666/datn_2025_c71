import { PageData } from "@/core/data/commonData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { ProvinceData, WardData } from "@data/locationData";

export class ProvinceAPI {
  static prefix: string = "/location/provinces";

  static async getProvinces(sort?: string): Promise<PageData<ProvinceData>> {
    try {
      const params: Record<string, string | number> = {};
      if (sort) params.sort = sort;

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
        .map((line) => JSON.parse(line) as ProvinceData);

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

  static async getWards(
    provinceCode: string,
    sort?: string
  ): Promise<PageData<WardData>> {
    try {
      const params: Record<string, string | number> = {};
      if (sort) params.sort = sort;

      const res = await fetchWithAuth(`${this.prefix}/${provinceCode}/wards`, {
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
        .map((line) => JSON.parse(line) as WardData);

      const pageHeader = parseInt(res.headers.get("X-Current-Page") || "0", 10);
      const totalHeader = parseInt(res.headers.get("X-Total-Items") || "0", 10);
      const sizeHeader = parseInt(
        res.headers.get("X-Page-Size") || "0",
        totalHeader
      );

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
}
