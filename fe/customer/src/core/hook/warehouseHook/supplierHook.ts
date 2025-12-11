import { QueryDataFilter } from "@/core/data/commonData";
import { getToastApi } from "@context/toastContext";
import { SupplierData } from "@data/warehouseData";
import { SupplierAPI } from "@net/warehouseNet/supplier";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region Supplier
export const useSuppliers = (filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["Suppliers", filter],
    queryFn: () => SupplierAPI.getSuppliers(filter),
    staleTime: 0,
  });
};

export const useSupplier = (uuid: string) => {
  return useQuery({
    queryKey: ["Supplier", uuid],
    queryFn: () => SupplierAPI.getSupplier(uuid),
    staleTime: 0,
  });
};

export function useCreateSupplier(onSuccess?: (data: SupplierData) => void) {
  return useMutation({
    mutationFn: ({
      name,
      contactInfo,
      address,
    }: {
      name: string;
      contactInfo: string;
      address: string;
    }) => SupplierAPI.createSupplier(name, contactInfo, address),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateSupplierName(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      SupplierAPI.updateSupplierName(uuid, name),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateSupplierWardCode(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, wardCode }: { uuid: string; wardCode: string }) =>
      SupplierAPI.updateSupplierWardCode(uuid, wardCode),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateSupplierAddress(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, address }: { uuid: string; address: string }) =>
      SupplierAPI.updateSupplierAddress(uuid, address),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteSupplier(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => SupplierAPI.deleteSupplier(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckSupplierName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (name: string) => SupplierAPI.checkSupplierName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion
