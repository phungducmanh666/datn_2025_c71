import { QueryDataFilter } from "@/core/data/commonData";
import { getToastApi } from "@context/toastContext";
import { BrandData } from "@data/productData";
import { BrandAPI } from "@net/productNet/brand";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region brand
export const useBrands = (filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["brands", filter],
    queryFn: () => BrandAPI.getBrands(filter),
    staleTime: 0,
  });
};

export const useBrand = (uuid: string) => {
  return useQuery({
    queryKey: ["brand", uuid],
    queryFn: () => BrandAPI.getBrand(uuid),
    staleTime: 0,
  });
};

export function useCreateBrand(onSuccess?: (data: BrandData) => void) {
  return useMutation({
    mutationFn: (name: string) => BrandAPI.createBrand(name),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateBrandName(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      BrandAPI.updateBrandName(uuid, name),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateBrandPhoto(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, photo }: { uuid: string; photo?: File }) =>
      BrandAPI.updateBrandPhoto(uuid, photo),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteBrand(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => BrandAPI.deleteBrand(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckBrandName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (name: string) => BrandAPI.checkBrandName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion
