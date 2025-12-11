import { getToastApi } from "@context/toastContext";
import { CartItemData } from "@data/orderData";
import { ProductData } from "@data/productData";
import { CartAPI } from "@net/orderNet/cart";
import { ProductAPI } from "@net/productNet/product";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCartItems = () => {
  return useQuery({
    queryKey: ["cartItems"],
    queryFn: () => CartAPI.getCartItems(),
    staleTime: 0,
  });
};

export function useAddToCart(onSuccess?: () => any) {
  return useMutation({
    mutationFn: (productUUID: string) => CartAPI.addToCart(productUUID),
    onSuccess: (rs) => {
      getToastApi().success("Đã thêm");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export function useRemoveFromCart(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (uuid: string) => CartAPI.removeCartItem(uuid),
    onSuccess: () => {
      getToastApi().success("Đã xóa");
      onSuccess?.();
    },
    onError: (error: any) => {
      getToastApi().error(error?.message || "Lỗi");
    },
  });
}

export const useCartProducts = (items: CartItemData[]) => {
  const ids = items?.map((item) => item.productUUID) || [];

  return useQuery<ProductData[]>({
    queryKey: ["cartProducts", ids],
    queryFn: async () => {
      if (!ids.length) return [];
      // gọi API lấy thông tin các product theo ID
      return await ProductAPI.getProductsByIds(ids);
    },
    enabled: ids.length > 0, // chỉ chạy khi có ID
    staleTime: 0,
  });
};
