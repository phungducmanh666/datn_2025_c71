import { getToastApi } from "@context/toastContext";
import { QueryDataFilter } from "@data/commonData";
import {
  CreateOrderRequest,
  OrderData,
  OrderLineData,
  OrderStatus
} from "@data/orderData";
import { ProductData } from "@data/productData";
import { OrderAPI, OrderStatusPath } from "@net/orderNet/order";
import { ProductAPI } from "@net/productNet/product";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface OrderProduct extends ProductData, OrderLineData {
  orderLineUUID: string
}

export function useCreateOrder(onSuccess?: (data: OrderData) => void) {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => OrderAPI.createOrder(data),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.(rs);
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export const useOrder = (uuid: string) => {
  return useQuery({
    queryKey: ["Order", uuid],
    queryFn: () => OrderAPI.getOrder(uuid),
    staleTime: 0,
  });
};

export const useOrders = (status?: OrderStatus, filter?: QueryDataFilter) => {
  return useQuery({
    queryKey: ["useOrders", status, filter],
    queryFn: () => {
      if (status === OrderStatus.ALL) {
        return OrderAPI.getOrders(undefined, filter);
      } else {
        return OrderAPI.getOrders(status, filter);
      }
    },
    staleTime: 0,
  });
};

export const useOrderProducts = (items: OrderLineData[]) => {
  const ids = items?.map((item) => item.productUUID) || [];

  return useQuery<OrderProduct[]>({
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
          ...item,
          orderLineUUID: item.uuid
        } as OrderProduct;
      });
    },
    enabled: ids.length > 0, // chỉ chạy khi có ID
    staleTime: 200,
  });
};

export function useComfirmOrder(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: OrderStatusPath }) =>
      OrderAPI.updateOrderStatus(uuid, status),
    onSuccess: () => {
      getToastApi().success("Đã cập nhật");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}
