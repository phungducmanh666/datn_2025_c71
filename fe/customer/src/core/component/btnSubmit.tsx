import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { BiArrowToRight } from "react-icons/bi";

interface BTNAddProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNSubmit: React.FC<BTNAddProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Gửi"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        shape="round"
        type="primary"
        size="small"
        {...props}
        icon={<BiArrowToRight />}
      />
    </Tooltip>
  );
};

export default BTNSubmit;
