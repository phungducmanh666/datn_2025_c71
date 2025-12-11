"use client";

import { useProductCompare } from "@context/productCompareContext";
import { ProductData } from "@data/productData";
import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { GrCompare } from "react-icons/gr";

interface BTNAddCompareProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
  product: ProductData;
}

const BTNAddCompare: React.FC<BTNAddCompareProps> = ({
  toolTipTitle,
  toolTipColor,
  product,
  icon,
  ...props
}) => {
  const { addProduct } = useProductCompare();

  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "So sánh sản phẩm"}
      color={toolTipColor ? toolTipColor : "orange"}
    >
      <Button
        variant="solid"
        color="orange"
        size="small"
        {...props}
        icon={<GrCompare />}
        onClick={() => {
          addProduct(product);
        }}
      />
    </Tooltip>
  );
};

export default BTNAddCompare;
