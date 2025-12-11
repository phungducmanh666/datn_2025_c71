import { RecommendationAPI } from "@net/recommendationNet/recommendation";
import { useQuery } from "@tanstack/react-query";
//#region recommendation hook
export const useRecommendedHomeProducts = (userUUID: string) => {
  return useQuery({
    queryKey: ["useRecommendedHomeProduct", userUUID],
    queryFn: () => RecommendationAPI.getRecommendedHomeProducts(userUUID),
    staleTime: 0,
  });
};
export const useRecommendedRelatedProducts = (userUUID: string, productUUID: string) => {
  return useQuery({
    queryKey: ["useRecommendedRelatedProduct", userUUID, productUUID],
    queryFn: () => RecommendationAPI.getRecommendedRelatedProducts(userUUID, productUUID),
    staleTime: 0,
  });
};
//#endregion


