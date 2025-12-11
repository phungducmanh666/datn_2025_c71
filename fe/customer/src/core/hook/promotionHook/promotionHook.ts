import { getToastApi } from "@context/toastContext";
import { QueryDataFilter } from "@data/commonData";
import { ProductData } from "@data/productData";
import { PromotionDetailRES, PromotionREQ, PromotionRES, PromotionStatus } from "@data/promotionData";
import { ProductAPI } from "@net/productNet/product";
import { PromotionAPI } from "@net/promotionNet/promotion";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface PromotionDetailRESProduct extends PromotionDetailRES {
  name: string;
  photoUrl: string;
  status: string;
  price: number;
}

export function useCreatePromotion(onSuccess?: (data: PromotionRES) => void) {
  return useMutation({
    mutationFn: (data: PromotionREQ) => PromotionAPI.createPromotion(data),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdatePromotionStatus(onSuccess?: () => any) {
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: PromotionStatus }) => PromotionAPI.updatePromotionStatus(id, status),
    onSuccess: () => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export const usePromotion = (id: number) => {
  return useQuery({
    queryKey: ["usePromotion", id],
    queryFn: () => PromotionAPI.getPromotion(id),
    staleTime: 200,
  });
};

export const usePromotions = (
  status?: PromotionStatus,
  filter?: QueryDataFilter
) => {
  return useQuery({
    queryKey: ["usePromotions", status, filter],
    queryFn: () => {
      if (status == PromotionStatus.ALL) {
        return PromotionAPI.getPromotions(undefined, filter);
      }
      return PromotionAPI.getPromotions(status, filter);
    },
    staleTime: 200,
  });
};

export const useProductDiscounts = (productUUID: string
) => {
  return useQuery({
    queryKey: ["useProductDiscounts", productUUID],
    queryFn: () => PromotionAPI.getProductDiscounts(productUUID),
    staleTime: 200,
  });
};

export const useOrderDiscounts = (totalDiscountAmount: number
) => {
  return useQuery({
    queryKey: ["useOrderDiscounts", totalDiscountAmount],
    queryFn: () => PromotionAPI.getOrderDiscounts(totalDiscountAmount),
    staleTime: 200,
  });
};

export const usePromotionProducts = (
  details: PromotionDetailRES[]
) => {

  const ids = details?.map((item) => item.productUUID) || [];

  return useQuery({
    queryKey: ["usePromotionProducts", details],
    queryFn: async (): Promise<PromotionDetailRESProduct[]> => {
      if (!ids.length) return [];
      const products = await ProductAPI.getProductsByIds(ids);
      return details.map((item) => {
        const product = products.find(
          (p: ProductData) => p.uuid === item.productUUID
        );
        return {
          name: product?.name,
          photoUrl: product?.photoUrl,
          status: product?.status,
          price: product?.price,
          ...item,
        } as PromotionDetailRESProduct;
      });
    },
    enabled: ids.length > 0,
    staleTime: 200,
  });
};