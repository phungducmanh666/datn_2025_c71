import { ProductCreateData, ProductData } from "@/core/data/productData";
import { getToastApi } from "@context/toastContext";
import { ProductAPI } from "@net/productNet/product";
import { useMutation, useQuery } from "@tanstack/react-query";

//#region catalog
export const useProduct = (uuid: string) => {
  return useQuery({
    queryKey: ["product", uuid],
    queryFn: () => ProductAPI.getProduct(uuid),
    staleTime: 0,
  });
};

export const useProductByIdsMutate = (onSuccess?: (products: ProductData[]) => any) => {

  return useMutation({
    mutationFn: (ids: string[]) => ProductAPI.getProductsByIds(ids),
    onSuccess: (rs) => {
      onSuccess?.(rs);
    },
    onError: (error: any) => {
    },
  });
};

export const useProducts = (filter?: ProductQueryDataFilter) => {
  return useQuery({
    queryKey: ["products", filter],
    queryFn: () => ProductAPI.getProducts(filter),
    staleTime: 0, // có thể tùy chỉnh nếu muốn cache lâu hơn
  });
};

export const useProductsByIds = (ids: string[]) => {
  return useQuery({
    queryKey: ["productsByIds", ids],
    queryFn: () => ProductAPI.getProductsByIds(ids),
    staleTime: 0,
  });
};

export function useCreateProduct(onSuccess?: (data: ProductData) => void) {
  return useMutation({
    mutationFn: (data: ProductCreateData) => ProductAPI.createProduct(data),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeleteProduct(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => ProductAPI.deleteProduct(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckProductName(onSuccess?: (result: boolean) => any) {
  return useMutation({
    mutationFn: (name: string) => ProductAPI.checkProductName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateProductName(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      ProductAPI.updateProductName(uuid, name),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateProductPhoto(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, photo }: { uuid: string; photo?: File }) =>
      ProductAPI.updateProductPhoto(uuid, photo),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateProductStatus(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: string }) =>
      ProductAPI.updateProductStatus(uuid, status),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdateProductPrice(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, price }: { uuid: string; price: number }) =>
      ProductAPI.updateProductPrice(uuid, price),
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

//#region images
export const useProductImages = (productUUID: string) => {
  return useQuery({
    queryKey: ["productImages", productUUID],
    queryFn: () => ProductAPI.getImages(productUUID),
    staleTime: 0,
  });
};

export function useAddProductImage(onSuccess?: () => any) {
  return useMutation({
    mutationFn: ({
      productUUID,
      photo,
    }: {
      productUUID: string;
      photo?: File;
    }) => ProductAPI.addImage(productUUID, photo),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRemoveProductImage(onSuccess?: () => any) {
  return useMutation({
    mutationFn: ({
      productUUID,
      imageUUID,
    }: {
      productUUID: string;
      imageUUID: string;
    }) => ProductAPI.deleteImage(productUUID, imageUUID),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

//#endregion

//#region product attribute
export const useProductAttributes = (productUUID: string) => {
  return useQuery({
    queryKey: ["productAttributes", productUUID],
    queryFn: () => ProductAPI.getAttributes(productUUID),
    staleTime: 0,
  });
};

export function useAddProductAttribute(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      productUUID,
      attributeUUID,
    }: {
      productUUID: string;
      attributeUUID: string;
    }) => ProductAPI.addAttribute(productUUID, attributeUUID),
    onSuccess: () => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRemoveProductAttribute(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      productUUID,
      attributeUUID,
    }: {
      productUUID: string;
      attributeUUID: string;
    }) => ProductAPI.deleteAttribute(productUUID, attributeUUID),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

//#endregion

//#region attribute value

export function useAddProductAttributeValue(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      productUUID,
      attributeUUID,
      value,
    }: {
      productUUID: string;
      attributeUUID: string;
      value: string;
    }) => ProductAPI.addAttributeValue(productUUID, attributeUUID, value),
    onSuccess: () => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRemoveProductAttributeValue(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      productUUID,
      attributeUUID,
      valueUUID,
    }: {
      productUUID: string;
      attributeUUID: string;
      valueUUID: string;
    }) =>
      ProductAPI.deleteAttributeValue(productUUID, attributeUUID, valueUUID),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion

//#region status
export const useProductStatus = () => {
  return useQuery({
    queryKey: ["productStatus"],
    queryFn: () => ProductAPI.getStatus(),
    staleTime: 0,
  });
};
//#endregion

//#region product lines
export const useProductProductLines = (productUUID: string) => {
  return useQuery({
    queryKey: ["useProductProductLines", productUUID],
    queryFn: () => ProductAPI.getProductLines(productUUID),
    staleTime: 0,
  });
};
//#endregion
