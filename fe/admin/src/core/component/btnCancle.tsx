import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { MdCancel } from "react-icons/md";

interface BTNCancleProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNCancle: React.FC<BTNCancleProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  children,
  ...props
}) => {
  return (
    <Tooltip title={toolTipTitle} color={toolTipColor}>
      <Button variant="solid" color="danger" {...props} icon={<MdCancel />}>
        {children ? children : "Đóng"}
      </Button>
    </Tooltip>
  );
};

export default BTNCancle;
