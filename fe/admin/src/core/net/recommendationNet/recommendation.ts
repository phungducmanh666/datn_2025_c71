import { getToastApi } from "@context/toastContext";
import { fetchWithAuth } from "@util/fetchUtil";
import { List } from "lodash";

export class RecommendationAPI {

    static prefix: string = "/recommend/api";

    //#reginon update item profile
    static async updateItemProfile(product_uid: string): Promise<List<string>> {
        try {
            const res = await fetchWithAuth(`${this.prefix}/update_item_profile/${product_uid}`, {
                method: "GET",
            });
            // if (!res.ok) {
            //     throw new Error("Lỗi khi lấy sản phẩm được đề xuất");
            // }
            const data = await res.json();
            return data;
        } catch (error: any) {
            const message = error?.message || "Lỗi khi update item profile";
            getToastApi().error(message);
            throw error;
        }
    }


}