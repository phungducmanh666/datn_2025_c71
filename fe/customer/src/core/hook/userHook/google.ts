import { getToastApi } from "@context/toastContext";
import { LoginGoogleAPI } from "@net/user/google";
import { useMutation } from "@tanstack/react-query";

export function useGetGoogleLoginUrl(onSuccess?: (url: string) => any) {
  return useMutation({
    mutationFn: () => LoginGoogleAPI.getLoginUrl(),
    onSuccess: (result: string) => {
      onSuccess?.(result);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi khi lấy url login");
    },
  });
}

export function useExchangeGoogleCodeForToken(
  onSuccess?: (data: string) => any
) {
  return useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      LoginGoogleAPI.exchangeCodeForToken(code, state),
    onSuccess: (result) => {
      onSuccess?.(result);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi khi lấy url login");
    },
  });
}
