import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { FaEye } from "react-icons/fa6";

interface BTNDetailProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNDetail: React.FC<BTNDetailProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Xem chi tiết"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        variant="solid"
        color="blue"
        shape="round"
        size="small"
        {...props}
        icon={<FaEye />}
      />
    </Tooltip>
  );
};

export default BTNDetail;
