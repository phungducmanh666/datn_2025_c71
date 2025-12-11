import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { FaFacebookMessenger } from "react-icons/fa";

interface BTNChatProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNChat: React.FC<BTNChatProps> = ({
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
        color="blue"
        shape="round"
        size="small"
        {...props}
        icon={<FaFacebookMessenger />}
      />
    </Tooltip>
  );
};

export default BTNChat;
