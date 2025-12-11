import { getToastApi } from "@context/toastContext";
import { ReviewAPI } from "@net/orderNet/review";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useReviews = (productUUID: string) => {
  return useQuery({
    queryKey: ["reviews", productUUID],
    queryFn: () => ReviewAPI.getReviews(productUUID),
    staleTime: 0,
  });
};

export function useCreateReview(onSuccess?: () => any) {
  return useMutation({
    mutationFn: ({
      orderLineUUID,
      content,
      star,
    }: {
      orderLineUUID: string;
      content: string;
      star: number;
    }) => ReviewAPI.createReview(orderLineUUID, content, star),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
