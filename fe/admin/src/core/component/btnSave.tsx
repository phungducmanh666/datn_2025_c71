import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { FaRegSave } from "react-icons/fa";

interface BTNSaveProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNSave: React.FC<BTNSaveProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  children,
  ...props
}) => {
  return (
    <Tooltip title={toolTipTitle} color={toolTipColor}>
      <Button type="primary" {...props} icon={<FaRegSave />}>
        {children ? children : "Lưu"}
      </Button>
    </Tooltip>
  );
};

export default BTNSave;
