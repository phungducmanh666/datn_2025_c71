import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { MdStarRate } from "react-icons/md";

interface BTNRateProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNRate: React.FC<BTNRateProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Đánh giá"}
      color={toolTipColor ? toolTipColor : "orange"}
    >
      <Button
        shape="round"
        color="orange"
        variant="solid"
        size="small"
        {...props}
        icon={<MdStarRate />}
      />
    </Tooltip>
  );
};

export default BTNRate;
