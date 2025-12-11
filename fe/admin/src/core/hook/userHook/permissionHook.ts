import { getToastApi } from "@context/toastContext";
import { PermissionData } from "@data/userData";
import { PermissionAPI } from "@net/userNet/permissions";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region Permission
export const usePermissions = (sort?: string) => {
  return useQuery({
    queryKey: ["Permisisons", sort],
    queryFn: () => PermissionAPI.getPermissions(sort),
    staleTime: 200,
  });
};

export function useCreatePermission(
  onSuccess?: (data: PermissionData) => void
) {
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => PermissionAPI.createPermission(name, description),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeletePermission(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => PermissionAPI.deletePermission(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckPermissionName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (name: string) => PermissionAPI.checkPermissionName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion
