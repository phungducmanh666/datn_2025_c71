import { PageData, QueryDataFilter } from "@/core/data/commonData";
import {
  BrandData,
  CatalogData,
  ProductLineData,
} from "@/core/data/productData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { ImageApi } from "@net/imageNet/image";

export class CatalogAPI {
  static prefix: string = "/product/catalogs";

  //#region catalog
  static async createCatalog(name: string): Promise<CatalogData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          name,
        },
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: CatalogData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getCatalog(uuid: string): Promise<CatalogData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: CatalogData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getCatalogs(
    filter: QueryDataFilter = {}
  ): Promise<PageData<CatalogData>> {
    try {
      const { page, size, sort, search } = filter;
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
        .map((line) => JSON.parse(line) as CatalogData);

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

  static async updateCatalogName(uuid: string, name: string): Promise<void> {
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

  static async updateCatalogPhoto(uuid: string, photo?: File): Promise<void> {
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

  static async deleteCatalog(uuid: string): Promise<void> {
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

  static async checkCatalogName(name: string): Promise<boolean> {
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

  //#region catalog bran
  static async connectBrand(
    catalogUUID: string,
    brandUUID: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${catalogUUID}/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: {
          "brand-uuid": brandUUID,
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

  static async getBrands(
    catalogUUID: string,
    filter: QueryDataFilter = {}
  ): Promise<PageData<BrandData>> {
    if (!!!catalogUUID)
      return {
        page: 0,
        size: 0,
        total: 0,
        items: [],
      };

    try {
      const { page, size, sort, search } = filter;
      const params: Record<string, string | number> = {};
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      if (sort) params.sort = sort;
      if (search) params.search = search;

      const res = await fetchWithAuth(`${this.prefix}/${catalogUUID}/brands`, {
        method: "GET",
        params,
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        // getToastApi().error(message);
        throw new Error(message);
      }

      // Lấy text NDJSON
      const text = await res.text();

      // Chia từng dòng JSON, lọc rỗng, parse
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as CatalogData);

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
      // const message = error?.message || "Đã có lỗi xảy ra";
      // console.error(error);
      // getToastApi().error(message);
      throw error;
    }
  }

  static async removeBrandConnection(
    catalogUUID: string,
    brandUUID: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${catalogUUID}/brands/${brandUUID}`,
        {
          method: "DELETE",
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
  //#endregion

  //#region product line

  static async createProductLine(
    catalogUUID: string,
    brandUUID: string,
    name: string
  ): Promise<ProductLineData> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${catalogUUID}/brands/${brandUUID}/product-lines`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            name: name,
          },
        }
      );

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: ProductLineData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getProductLines(
    catalogUUID: string,
    brandUUID: string,
    filter: QueryDataFilter = {}
  ): Promise<PageData<ProductLineData>> {
    if (!!!catalogUUID || !!!brandUUID) {
      return {
        page: 0,
        size: 0,
        total: 0,
        items: [],
      };
    }

    try {
      const { page, size, sort, search } = filter;
      const params: Record<string, string | number> = {};
      if (page !== undefined) params.page = page;
      if (size !== undefined) params.size = size;
      if (sort) params.sort = sort;
      if (search) params.search = search;

      const res = await fetchWithAuth(
        `${this.prefix}/${catalogUUID}/brands/${brandUUID}/product-lines`,
        {
          method: "GET",
          params,
        }
      );

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        // getToastApi().error(message);
        throw new Error(message);
      }

      // Lấy text NDJSON
      const text = await res.text();

      // Chia từng dòng JSON, lọc rỗng, parse
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ProductLineData);

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
      // const message = error?.message || "Đã có lỗi xảy ra";
      // console.error(error);
      // getToastApi().error(message);
      throw error;
    }
  }

  static async checkProductLineName(
    catalogUUID: string,
    brandUUID: string,
    name: string
  ): Promise<boolean> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${catalogUUID}/brands/${brandUUID}/product-lines/check-name`,
        {
          method: "GET",
          params: {
            name,
          },
        }
      );

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
}
