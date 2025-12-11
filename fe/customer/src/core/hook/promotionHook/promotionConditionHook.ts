import { PromotionConditionAPI } from "@net/promotionNet/promotionCondition";
import { useQuery } from "@tanstack/react-query";

export const usePromotionConditions = (ids: number[]) => {
  return useQuery({
    queryKey: ["usePromotionConditions", ids],
    queryFn: () => {
      if (ids && ids.length > 0) {
        return PromotionConditionAPI.getPromotionConditions(ids)
      }
      return null;
    },
    staleTime: 200,
  });
};

