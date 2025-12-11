import { getToastApi } from "@context/toastContext";
import { LoginInfo } from "@data/userData";
import { AuthAPI } from "@net/userNet/auth";
import { useMutation } from "@tanstack/react-query";

export function useLogin(onSuccess?: (token: string) => void) {
  return useMutation({
    mutationFn: (account: { username: string; password: string }) =>
      AuthAPI.generateToken(account),
    onSuccess: (token) => {
      onSuccess?.(token);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useParserToken(onSuccess?: (info: LoginInfo) => void) {
  return useMutation({
    mutationFn: (token: string) => AuthAPI.parserToken(token),
    onSuccess: (info) => {
      onSuccess?.(info);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
