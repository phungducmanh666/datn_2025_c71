import { QueryDataFilter } from "@/core/data/commonData";
import { getToastApi } from "@context/toastContext";
import { WarehouseData } from "@data/warehouseData";
import { WarehouseAPI } from "@net/warehouseNet/warehouse";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region Warehouse
export const useWarehouses = (filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["Warehouses", filter],
    queryFn: () => WarehouseAPI.getWarehouses(filter),
    staleTime: 0,
  });
};

export const useWarehouse = (uuid: string) => {
  return useQuery({
    queryKey: ["Warehouse", uuid],
    queryFn: () => WarehouseAPI.getWarehouse(uuid),
    staleTime: 0,
  });
};

export function useCreateWarehouse(onSuccess?: (data: WarehouseData) => void) {
  return useMutation({
    mutationFn: ({
      name,
      wardCode,
      address,
    }: {
      name: string;
      wardCode: string;
      address: string;
    }) => WarehouseAPI.createWarehouse(name, wardCode, address),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateWarehouseName(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      WarehouseAPI.updateWarehouseName(uuid, name),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateWarehouseWardCode(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, wardCode }: { uuid: string; wardCode: string }) =>
      WarehouseAPI.updateWarehouseWardCode(uuid, wardCode),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateWarehouseAddress(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, address }: { uuid: string; address: string }) =>
      WarehouseAPI.updateWarehouseAddress(uuid, address),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteWarehouse(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => WarehouseAPI.deleteWarehouse(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckWarehouseName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (name: string) => WarehouseAPI.checkWarehouseName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion
