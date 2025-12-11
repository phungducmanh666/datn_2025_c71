import { fetchWithAuth } from "@util/fetchUtil";
import { List } from "lodash";

export class RecommendationAPI {
  static prefix: string = "/recommend/api";

  //#region recommended home products
  static async getRecommendedHomeProducts(
    userUUID: string
  ): Promise<List<string>> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/recommendation_home_products/${userUUID}`,
        {
          method: "GET",
        }
      );
      // if (!res.ok) {
      //     throw new Error("Lỗi khi lấy sản phẩm được đề xuất");
      // }
      const data = await res.json();
      return data as List<string>;
    } catch (error: any) {
      const message = error?.message || "Lỗi khi lấy sản phẩm được đề xuất";
      throw error;
    }
  }
  //#endregion

  //#region recommended home products
  static async getRecommendedRelatedProducts(
    userUUID: string,
    productUUID: string
  ): Promise<List<string>> {
    try {
      const res = await fetchWithAuth(
        `${this.prefix}/recommendation_similar_products/${productUUID}/${userUUID}`,
        {
          method: "GET",
        }
      );
      // if (!res.ok) {
      //     throw new Error("Lỗi khi lấy sản phẩm được đề xuất");
      // }
      const data = await res.json();
      return data as List<string>;
    } catch (error: any) {
      const message = error?.message || "Lỗi khi lấy sản phẩm tương tự";
      throw error;
    }
  }

  //#endregion
}
