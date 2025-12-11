import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { PromotionConditionRES } from "@data/promotionData";



export class PromotionConditionAPI {
    static prefix: string = "/promotion/promotion-conditions";

    //#region crud

    static async getPromotionConditions(ids: number[]): Promise<PromotionConditionRES[]> {
        try {
            const res = await fetchWithAuth(`${this.prefix}`, {
                method: "GET",
                params: {
                    ids: ids.join(",")
                }
            });

            if (!res.ok) {
                const message = `Failed: ${res.statusText}`;
                getToastApi().error(message);
                throw new Error(message);
            }

            const data: PromotionConditionRES[] = await res.json();
            return data;
        } catch (error: any) {
            const message = error?.message || "Đã có lỗi xảy ra";
            getToastApi().error(message);
            throw error;
        }
    }


    //#endregion
}
