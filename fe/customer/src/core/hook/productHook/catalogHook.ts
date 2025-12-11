import { QueryDataFilter } from "@/core/data/commonData";
import { CatalogData, ProductLineData } from "@/core/data/productData";
import { getToastApi } from "@context/toastContext";
import { CatalogAPI } from "@net/productNet/catalog";
import { ProductLineAPI } from "@net/productNet/productLine";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region catalog
export const useCatalogs = (filter?: QueryDataFilter) => {
  return useQuery({
    queryKey: ["catalogs", filter],
    queryFn: () => CatalogAPI.getCatalogs(filter),
    staleTime: 0,
  });
};

export const useCatalog = (uuid: string) => {
  return useQuery({
    queryKey: ["catalog", uuid],
    queryFn: () => CatalogAPI.getCatalog(uuid),
    staleTime: 0,
  });
};

export function useCreateCatalog(onSuccess?: (data: CatalogData) => void) {
  return useMutation({
    mutationFn: (name: string) => CatalogAPI.createCatalog(name),
    onSuccess: (data: CatalogData) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(data);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateCatalogName(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      CatalogAPI.updateCatalogName(uuid, name),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateCatalogPhoto(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, photo }: { uuid: string; photo?: File }) =>
      CatalogAPI.updateCatalogPhoto(uuid, photo),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteCatalog(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => CatalogAPI.deleteCatalog(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckCatalogName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (name: string) => CatalogAPI.checkCatalogName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion

//#region brand
export const useCatalogBrands = (
  catalogUUID?: string,
  filter?: QueryDataFilter
) => {
  return useQuery({
    queryKey: ["catalogBrands", filter],
    queryFn: () => CatalogAPI.getBrands(catalogUUID!, filter),
    enabled: !!catalogUUID,
    staleTime: 0,
  });
};

export function useCatalogConnectBrand(onSuccess?: () => any) {
  return useMutation({
    mutationFn: ({
      catalogUUID,
      brandUUID,
    }: {
      catalogUUID: string;
      brandUUID: string;
    }) => CatalogAPI.connectBrand(catalogUUID, brandUUID),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRemoveCatalogBrandConnection(onSuccess?: () => any) {
  return useMutation({
    mutationFn: ({
      catalogUUID,
      brandUUID,
    }: {
      catalogUUID: string;
      brandUUID: string;
    }) => CatalogAPI.removeBrandConnection(catalogUUID, brandUUID),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion

//#region product line
export const useCatalogProductLines = (
  catalogUUID?: string | undefined,
  brandUUID?: string | undefined,
  filter?: QueryDataFilter
) => {
  return useQuery({
    queryKey: ["catalogProductLines", filter],
    queryFn: () => CatalogAPI.getProductLines(catalogUUID!, brandUUID!, filter),
    enabled: !!catalogUUID && !!brandUUID,
    staleTime: 0,
  });
};

export function useCreateProductLine(
  onSuccess?: (data: ProductLineData) => void
) {
  return useMutation({
    mutationFn: ({
      catalogUUID,
      brandUUID,
      name,
    }: {
      catalogUUID: string;
      brandUUID: string;
      name: string;
    }) => CatalogAPI.createProductLine(catalogUUID, brandUUID, name),
    onSuccess: (result) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(result);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteProductLine(onSuccess: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => ProductLineAPI.deleteProductLine(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckProductLineName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: ({
      catalogUUID,
      brandUUID,
      name,
    }: {
      catalogUUID: string;
      brandUUID: string;
      name: string;
    }) => CatalogAPI.checkProductLineName(catalogUUID, brandUUID, name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion
