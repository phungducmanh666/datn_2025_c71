import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { PromotionDetailRES } from "@data/promotionData";



export class PromotionDetailAPI {
    static prefix: string = "/promotion/promotion-details";

    //#region crud

    static async getPromotionDetail(id: number): Promise<PromotionDetailRES> {
        try {
            const res = await fetchWithAuth(`${this.prefix}/${id}`, {
                method: "GET",
            });

            if (!res.ok) {
                const message = `Failed: ${res.statusText}`;
                getToastApi().error(message);
                throw new Error(message);
            }

            const data: PromotionDetailRES = await res.json();
            return data;
        } catch (error: any) {
            const message = error?.message || "Đã có lỗi xảy ra";
            getToastApi().error(message);
            throw error;
        }
    }


    //#endregion
}
