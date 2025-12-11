import { getToastApi } from "@context/toastContext";
import { RecommendationAPI } from "@net/recommendationNet/recommendation";
import { useMutation } from "@tanstack/react-query";
//#region recommendation hook
export function useUpdateItemProfile(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (
      productUUID: string,
    ) => RecommendationAPI.updateItemProfile(productUUID),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion


