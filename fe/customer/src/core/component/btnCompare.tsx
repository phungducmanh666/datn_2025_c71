import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { GrCompare } from "react-icons/gr";

interface BTNCompareProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNCompare: React.FC<BTNCompareProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Sản phẩm so sánh"}
      color={toolTipColor ? toolTipColor : "orange"}
    >
      <Button
        variant="solid"
        color="orange"
        shape="round"
        size="small"
        {...props}
        icon={<GrCompare />}
      />
    </Tooltip>
  );
};

export default BTNCompare;
