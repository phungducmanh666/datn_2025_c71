import { getToastApi } from "@context/toastContext";
import { AccountAPI } from "@net/user/account";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region Role

export const useAccount = (username: string) => {
  return useQuery({
    queryKey: ["Account", username],
    queryFn: () => AccountAPI.getAccount(username),
    staleTime: 0,
  });
};

//#endregion

export const useAccountRoles = (username: string) => {
  return useQuery({
    queryKey: ["AccountRoles", username],
    queryFn: () => AccountAPI.getRoleRoles(username),
    staleTime: 0,
  });
};

export function useAssignRole(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      username,
      roleUUID,
    }: {
      username: string;
      roleUUID: string;
    }) => AccountAPI.assignRole(username, roleUUID),
    onSuccess: () => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRemoveRole(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      username,
      roleUUID,
    }: {
      username: string;
      roleUUID: string;
    }) => AccountAPI.removeRole(username, roleUUID),
    onSuccess: () => {
      getToastApi().success("Đã gỡ");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
