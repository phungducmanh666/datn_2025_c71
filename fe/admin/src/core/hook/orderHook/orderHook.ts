import { getToastApi } from "@context/toastContext";
import { QueryDataFilter } from "@data/commonData";
import {
  CreateOrderRequest,
  OrderData,
  OrderLineData,
  OrderStatus
} from "@data/orderData";
import { ProductData, StatusStatisticsData } from "@data/productData";
import { OrderAPI, OrderStatusPath } from "@net/orderNet/order";
import { ProductAPI } from "@net/productNet/product";
import { StockAPI } from "@net/warehouseNet/stock";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface OrderProduct extends ProductData, OrderLineData {
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
    staleTime: 200,
  });
};

export const useOrders = (
  status?: OrderStatus,
  customerUUID?: string,
  filter?: QueryDataFilter
) => {
  return useQuery({
    queryKey: ["useOrders", customerUUID, status, filter],
    queryFn: () => {
      if (status == OrderStatus.ALL) {
        return OrderAPI.getOrders(undefined, customerUUID, filter);
      }
      return OrderAPI.getOrders(status, customerUUID, filter);
    },
    staleTime: 200,
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

//#region statistics
export const useOrderStatusStatistics = () => {
  return useQuery({
    queryKey: ["useOrderStatusStatistics"],
    queryFn: (): Promise<StatusStatisticsData[]> =>
      OrderAPI.getStatusStatistics(),
    staleTime: 200,
  });
};

export const useOrderStatistics = ({
  startDate,
  endDate,
}: {
  startDate: string | Date;
  endDate: string | Date;
}) => {
  return useQuery({
    queryKey: ["useOrderStatistics", startDate, endDate],
    queryFn: () => OrderAPI.getOrderStatistics(startDate, endDate),
    staleTime: 200,
  });
};
//#endregion


export const useCheckDuHangHoaChoDonHang = (items: OrderLineData[]) => {
  const ids = items?.map((item) => item.productUUID) || [];

  return useQuery<boolean>({
    queryKey: ["useCheckDuHangHoaChoDonHang", ids],
    queryFn: async () => {
      if (!ids.length) throw new Error("Đơn hàng không hợp lệ");

      const productStocks = await StockAPI.getProductStockByIds(ids);

      for (let i = 0; i < productStocks.length; i++) {
        const stock = productStocks[i];
        for (let j = 0; j < items.length; j++) {
          const item = items[j];
          if (stock.uuid == item.productUUID) {
            if (stock.stock < item.number)
              return false;
          }
        }
      }

      return true;

    },
    enabled: ids.length > 0, // chỉ chạy khi có ID
    staleTime: 200,
  });
};