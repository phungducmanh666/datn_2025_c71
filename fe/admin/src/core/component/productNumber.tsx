import { useProductStock } from "@hook/warehouseHook/stockHook";
import { ConvertUtil } from "@util/convertUtil";
import React from "react";

interface ProductNumberProps {
  uuid: string;
}

const ProductNumber: React.FC<ProductNumberProps> = ({ uuid }) => {
  const { data: stock } = useProductStock(uuid);

  return <>{ConvertUtil.formatVNNumber(stock)}</>;
};

export default ProductNumber;
