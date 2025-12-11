import {
  AttributeGroupData,
  ProductCreateData,
  ProductData,
  ProductImageData,
  ProductLineData,
  ProductStatusData,
} from "@/core/data/productData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { PageData } from "@data/commonData";
import { ImageApi } from "@net/imageNet/image";

export class ProductAPI {
  static prefix: string = "/product/products";

  //#region product

  static async createProduct(
    productData: ProductCreateData
  ): Promise<ProductData> {
    try {
      const photo = productData.info.photo;
      const photoUrl = await ImageApi.uploadImage(photo);

      const res = await fetchWithAuth(`${this.prefix}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: productData.metadata,
          info: {
            name: productData.info.name,
            price: productData.info.price,
            photoUrl,
          },
        }),
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data = (await res.json()) as ProductData;
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getProduct(uuid: string): Promise<ProductData> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: ProductData = await res.json();
      return data;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      getToastApi().error(message);
      throw error;
    }
  }

  static async getProducts(
    filter: ProductQueryDataFilter = {}
  ): Promise<PageData<ProductData>> {
    try {
      const {
        catalogUUID,
        brandUUID,
        productLineUUIDS,
        priceRange,
        page,
        size,
        sort,
        search,
      } = filter;

      const params: Record<string, any> = {};

      if (catalogUUID) params["catalog-uuid"] = catalogUUID;
      if (brandUUID) params["brand-uuid"] = brandUUID;
      if (productLineUUIDS?.length)
        params["product-line-uuids"] = productLineUUIDS.join(",");
      if (priceRange?.length) params["price"] = priceRange.join(",");
      if (page !== undefined) params.page = page - 1;
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

      // Lấy text NDJSON
      const text = await res.text();

      // Chia từng dòng JSON, lọc rỗng, parse
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ProductData);

      const pageHeader = parseInt(res.headers.get("X-Current-Page") || "0", 10);
      const sizeHeader = parseInt(res.headers.get("X-Page-Size") || "0", 10);
      const totalHeader = parseInt(res.headers.get("X-Total-Items") || "0", 10);

      return {
        page: pageHeader,
        size: sizeHeader,
        total: totalHeader,
        items: items.filter(
          (item) => item.status !== "HIDE" && item.status !== "DRAFT"
        ),
      };
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async updateProductName(uuid: string, name: string): Promise<void> {
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

  static async updateProductStatus(
    uuid: string,
    status: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/status`, {
        method: "PATCH",
        params: { status },
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

  static async updateProductPrice(uuid: string, price: number): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/unit-price`, {
        method: "PATCH",
        params: { "unit-price": price },
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

  static async updateProductPhoto(uuid: string, photo?: File): Promise<void> {
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

  static async deleteProduct(uuid: string): Promise<void> {
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

  static async checkProductName(name: string): Promise<boolean> {
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

  //#region image
  static async addImage(uuid: string, file?: File): Promise<void> {
    try {
      if (!file) return;

      const url = await ImageApi.uploadImage(file);

      const res = await fetchWithAuth(`${this.prefix}/${uuid}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: { "photo-url": url },
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

  static async getImages(uuid: string): Promise<ProductImageData[]> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/images`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const text = await res.text();
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ProductImageData);

      return items;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async deleteImage(uuid: string, imageUUID: string): Promise<void> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${uuid}/images/${imageUUID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
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

  //#region attribute
  static async addAttribute(
    uuid: string,
    attributeUUID: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/attributes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        params: { "attribute-uuid": attributeUUID },
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

  static async getAttributes(uuid: string): Promise<AttributeGroupData[]> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/attributes`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const text = await res.text();
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as AttributeGroupData);

      return items;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }

  static async deleteAttribute(
    uuid: string,
    attributeUUID: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${uuid}/attributes/${attributeUUID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
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

  //#region  attribute values
  static async addAttributeValue(
    uuid: string,
    attributeUUID: string,
    value: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${uuid}/attributes/${attributeUUID}/values`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          params: { value: value },
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
  static async deleteAttributeValue(
    uuid: string,
    attributeUUID: string,
    valueUUID: string
  ): Promise<void> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/${uuid}/attributes/${attributeUUID}/values/${valueUUID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
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

  //#region status
  static async getStatus(): Promise<ProductStatusData[]> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/status`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const text = await res.text();
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ProductStatusData);

      return items;
    } catch (error: any) {
      const message = error?.message || "Đã có lỗi xảy ra";
      console.error(error);
      getToastApi().error(message);
      throw error;
    }
  }
  //#endregion

  //#region helper
  static async getProductsByIds(ids: string[]): Promise<ProductData[]> {
    if (!ids || ids.length === 0) return [];
    try {
      const products = await Promise.all(
        ids.map(async (id) => {
          const product = await ProductAPI.getProduct(id);
          return product;
        })
      );
      return products;
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
      return [];
    }
  }
  //#endregion

  //#region product lines
  static async getProductLines(uuid: string): Promise<ProductLineData[]> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}/product-lines`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const text = await res.text();
      const items = text
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ProductLineData);

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
