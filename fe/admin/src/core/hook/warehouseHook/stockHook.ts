import { StockAPI } from "@net/warehouseNet/stock";
import { useQuery } from "@tanstack/react-query";

//#region Supplier
export const useProductStock = (uuid: string) => {
  return useQuery({
    queryKey: ["Stock", uuid],
    queryFn: () => StockAPI.getProductStock(uuid),
    staleTime: 200,
  });
};

//#endregion
