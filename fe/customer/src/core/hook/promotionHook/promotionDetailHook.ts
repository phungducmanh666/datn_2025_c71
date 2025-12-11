import { PromotionDetailAPI } from "@net/promotionNet/promotionDetail";
import { useQuery } from "@tanstack/react-query";

export const usePromotionDetail = (id: number) => {
  return useQuery({
    queryKey: ["usePromotionDetail", id],
    queryFn: () => {
      if (id != -1) {
        return PromotionDetailAPI.getPromotionDetail(id)
      }
      return null;
    },
    staleTime: 200,
  });
};

