import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";

export class StockAPI {
  static prefix: string = "/warehouse/stocks";

  static async getProductStock(uuid: string): Promise<number> {
    try {
      const res = await fetchWithAuth(`${this.prefix}/${uuid}`, {
        method: "GET",
      });

      if (!res.ok) {
        const message = `Failed: ${res.statusText}`;
        getToastApi().error(message);
        throw new Error(message);
      }

      const data: number = parseInt(await res.text(), 10);
      return data;
    } catch (error: any) {
      // const message = error?.message || "Đã có lỗi xảy ra";
      // getToastApi().error(message);
      // throw error;
      return 0;
    }
  }

  static async getProductStockByIds(ids: string[]): Promise<{ uuid: string, stock: number }[]> {
    if (!ids || ids.length === 0) return [];
    try {

      const productStocks = await Promise.all(
        ids.map(async (id) => {
          const stock = await StockAPI.getProductStock(id);
          return { uuid: id, stock };
        })
      );



      return productStocks;
    } catch (error) {
      console.error("Lỗi khi tải thông tin sản phẩm:", error);
      return [];
    }
  }
}
