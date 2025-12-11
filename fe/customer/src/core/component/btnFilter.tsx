import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { FiFilter } from "react-icons/fi";

interface BTNFilterProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNFilter: React.FC<BTNFilterProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Lọc"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        shape="round"
        type="primary"
        size="small"
        {...props}
        icon={<FiFilter />}
      />
    </Tooltip>
  );
};

export default BTNFilter;
