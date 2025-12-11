import { PageData, QueryDataFilter } from "@/core/data/commonData";
import { fetchWithAuth } from "@/core/util/fetchUtil";
import { getToastApi } from "@context/toastContext";
import { PromotionConditionRES, PromotionDetailRES, PromotionREQ, PromotionRES, PromotionStatus } from "@data/promotionData";
import { SpringPageResponse } from "@net/orderNet/order";



export class PromotionAPI {
    static prefix: string = "/promotion/promotions";

    //#region crud

    static async createPromotion(promotionData: PromotionREQ): Promise<PromotionRES> {
        try {
            const res = await fetchWithAuth(`${this.prefix}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(promotionData),
            });

            if (!res.ok) {
                const message = `Failed: ${res.statusText}`;
                getToastApi().error(message);
                throw new Error(message);
            }

            const data: PromotionRES = await res.json();
            return data;
        } catch (error: any) {
            const message = error?.message || "Đã có lỗi xảy ra";
            getToastApi().error(message);
            throw error;
        }
    }


    static async getPromotion(id: number): Promise<PromotionRES> {
        try {
            const res = await fetchWithAuth(`${this.prefix}/${id}`, {
                method: "GET",
            });

            if (!res.ok) {
                const message = `Failed: ${res.statusText}`;
                getToastApi().error(message);
                throw new Error(message);
            }

            const data: PromotionRES = await res.json();
            return data;
        } catch (error: any) {
            const message = error?.message || "Đã có lỗi xảy ra";
            getToastApi().error(message);
            throw error;
        }
    }


    static async updatePromotionStatus(id: number, status: PromotionStatus): Promise<void> {
        try {
            const res = await fetchWithAuth(`${this.prefix}/${id}/status`, {
                method: "PATCH",
                params: {
                    status: status
                }
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



    static async getPromotions(
        status?: PromotionStatus,
        filter: QueryDataFilter = {}
    ): Promise<PageData<PromotionRES>> {
        try {
            // 1. Lấy tất cả các filter cần thiết
            const { page, size, sort } = filter;

            // 2. Chuẩn bị tham số URL (params)
            const params: Record<string, string | number> = {};
            if (page !== undefined) params.page = page;
            if (size !== undefined) params.size = size;
            if (sort) params.sort = sort;

            // THÊM CÁC THAM SỐ LỌC CÒN THIẾU
            if (status) params.status = status;
            // Tên tham số phải khớp với backend: name = "customer-uuid"

            // 3. Gọi API
            const res = await fetchWithAuth(`${this.prefix}`, {
                method: "GET",
                params, // fetchWithAuth cần xử lý việc biến params thành query string
            });

            if (!res.ok) {
                const message = `Failed: ${res.statusText}`;
                getToastApi().error(message);
                throw new Error(message);
            }

            const pageData: SpringPageResponse<PromotionRES> = await res.json();

            return {
                page: pageData.number, // Spring dùng 'number' cho chỉ mục trang
                size: pageData.size,
                total: pageData.totalElements, // Spring dùng 'totalElements' cho tổng số phần tử
                items: pageData.content, // Spring dùng 'content' cho danh sách items
            };
        } catch (error: any) {
            const message = error?.message || "Đã có lỗi xảy ra";
            console.error(error);
            getToastApi().error(message);
            throw error;
        }
    }

    static async getProductDiscounts(productUUID: string): Promise<PromotionDetailRES[]> {
        try {
            const res = await fetchWithAuth(`${this.prefix}/product/${productUUID}`, {
                method: "GET",
            });

            if (!res.ok) {
                const message = `Failed: ${res.statusText}`;
                getToastApi().error(message);
                throw new Error(message);
            }

            const data: PromotionDetailRES[] = await res.json();
            return data;
        } catch (error: any) {
            const message = error?.message || "Đã có lỗi xảy ra";
            getToastApi().error(message);
            throw error;
        }
    }

    static async getOrderDiscounts(totalDiscountAmount: number): Promise<PromotionConditionRES[]> {
        try {
            const res = await fetchWithAuth(`${this.prefix}/discount-condition`, {
                method: "GET",
                params: {
                    "total-discount-amount": totalDiscountAmount
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
