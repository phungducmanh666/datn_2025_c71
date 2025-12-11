import { QueryDataFilter } from "@/core/data/commonData";
import { getToastApi } from "@context/toastContext";
import { RoleData } from "@data/userData";
import { RoleAPI } from "@net/user/role";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region Role
export const useRoles = (filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["Roles", filter],
    queryFn: () => RoleAPI.getRoles(filter),
    staleTime: 0,
  });
};

export const useRole = (uuid: string) => {
  return useQuery({
    queryKey: ["Role", uuid],
    queryFn: () => RoleAPI.getRole(uuid),
    staleTime: 0,
  });
};

export function useCreateRole(onSuccess?: (data: RoleData) => void) {
  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) => RoleAPI.createRole(name, description),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateRoleName(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      RoleAPI.updateRoleName(uuid, name),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateRoleDescription(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      uuid,
      description,
    }: {
      uuid: string;
      description: string;
    }) => RoleAPI.updateRoleDescription(uuid, description),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteRole(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => RoleAPI.deleteRole(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckRoleName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (name: string) => RoleAPI.checkRoleName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion

export const useRolePermissions = (uuid: string) => {
  return useQuery({
    queryKey: ["RolePermissions", uuid],
    queryFn: () => RoleAPI.getRolePermissions(uuid),
    staleTime: 0,
  });
};

export function useAssignPermissions(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      roleUUID,
      permissionUUID,
    }: {
      roleUUID: string;
      permissionUUID: string;
    }) => RoleAPI.assignPermission(roleUUID, permissionUUID),
    onSuccess: () => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRemovePermissions(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      roleUUID,
      permissionUUID,
    }: {
      roleUUID: string;
      permissionUUID: string;
    }) => RoleAPI.removePermission(roleUUID, permissionUUID),
    onSuccess: () => {
      getToastApi().success("Đã gỡ");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
