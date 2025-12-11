import { QueryDataFilter } from "@/core/data/commonData";
import { getToastApi } from "@context/toastContext";
import { ProductData } from "@data/productData";
import {
  PurchaseOrderData,
  PurchaseOrderItemData,
  PurchaseOrderReceiptItemData,
} from "@data/warehouseData";
import { ProductAPI } from "@net/productNet/product";
import { PurchaseOrderAPI } from "@net/warehouseNet/purchaseOrder";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface PurchaseOrderProduct extends ProductData {
  numberOrder: number;
  numberReceived: number;
}

export interface PurchaseOrderReceiptProduct extends ProductData {
  number: number;
}

//#region PurchaseOrder
export const usePurchaseOrders = (filter: QueryDataFilter) => {
  return useQuery({
    queryKey: ["PurchaseOrders", filter],
    queryFn: () => PurchaseOrderAPI.getPurchaseOrders(filter),
    staleTime: 0,
  });
};

export const usePurchaseOrder = (uuid: string) => {
  return useQuery({
    queryKey: ["PurchaseOrder", uuid],
    queryFn: () => PurchaseOrderAPI.getPurchaseOrder(uuid),
    staleTime: 0,
  });
};

export const usePurchaseOrderProducts = (items: PurchaseOrderItemData[]) => {
  const ids = items?.map((item) => item.productUUID) || [];

  return useQuery<PurchaseOrderProduct[]>({
    queryKey: ["purchaseOrderProducts", ids],
    queryFn: async () => {
      if (!ids.length) return [];

      // gọi API lấy thông tin các product theo ID
      const products = await ProductAPI.getProductsByIds(ids);

      // merge dữ liệu items (số lượng) với dữ liệu sản phẩm
      return items.map((item) => {
        const product = products.find(
          (p: ProductData) => p.uuid === item.productUUID
        );
        return {
          ...product,
          numberOrder: item.numberOrder,
          numberReceived: item.numberReceived,
        } as PurchaseOrderProduct;
      });
    },
    enabled: ids.length > 0, // chỉ chạy khi có ID
    staleTime: 0,
  });
};

export const usePurchaseOrderReceiptProducts = (
  items: PurchaseOrderReceiptItemData[]
) => {
  const ids = items?.map((item) => item.productUUID) || [];

  return useQuery<PurchaseOrderReceiptProduct[]>({
    queryKey: ["purchaseOrderReceiptProducts", ids],
    queryFn: async () => {
      if (!ids.length) return [];

      // gọi API lấy thông tin các product theo ID
      const products = await ProductAPI.getProductsByIds(ids);

      // merge dữ liệu items (số lượng) với dữ liệu sản phẩm
      return items.map((item) => {
        const product = products.find(
          (p: ProductData) => p.uuid === item.productUUID
        );
        return {
          ...product,
          number: item.number,
        } as PurchaseOrderReceiptProduct;
      });
    },
    enabled: ids.length > 0, // chỉ chạy khi có ID
    staleTime: 0,
  });
};

export function useCreatePurchaseOrder(
  onSuccess?: (data: PurchaseOrderData) => void
) {
  return useMutation({
    mutationFn: ({
      supplierUUID,
      note,
      items,
    }: {
      supplierUUID: string;
      note: string;
      items: { productUUID: string; quantity: number }[];
    }) => PurchaseOrderAPI.createPurchaseOrder(supplierUUID, note, items),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdatePurchaseOrderName(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, name }: { uuid: string; name: string }) =>
      PurchaseOrderAPI.updatePurchaseOrderName(uuid, name),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdatePurchaseOrderWardCode(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, wardCode }: { uuid: string; wardCode: string }) =>
      PurchaseOrderAPI.updatePurchaseOrderWardCode(uuid, wardCode),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useUpdatePurchaseOrderAddress(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, address }: { uuid: string; address: string }) =>
      PurchaseOrderAPI.updatePurchaseOrderAddress(uuid, address),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useDeletePurchaseOrder(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => PurchaseOrderAPI.deletePurchaseOrder(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useCheckPurchaseOrderName(
  onSuccess?: (result: boolean) => any
) {
  return useMutation({
    mutationFn: (name: string) => PurchaseOrderAPI.checkPurchaseOrderName(name),
    onSuccess: (isExists: boolean) => {
      onSuccess?.(isExists);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
//#endregion

//#region receipt
export function useCreatePurchaseOrderReceipt(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      warehouseUUID,
      purchaseOrderUUID,
      items,
    }: {
      warehouseUUID: string;
      purchaseOrderUUID: string;
      items: { productUUID: string; quantity: number }[];
    }) =>
      PurchaseOrderAPI.createPurchaseOrderReceipt(
        warehouseUUID,
        purchaseOrderUUID,
        items
      ),
    onSuccess: () => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export const usePurchaseOrderReceipts = (purchaseOrderUUID: string) => {
  return useQuery({
    queryKey: ["PurchaseOrderReceipts", purchaseOrderUUID],
    queryFn: () => PurchaseOrderAPI.getPurchaseOrderReceipts(purchaseOrderUUID),
    staleTime: 0,
  });
};
//#endregion
