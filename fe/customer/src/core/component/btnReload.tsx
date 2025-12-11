import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { TfiReload } from "react-icons/tfi";

interface BTNReloadProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNReload: React.FC<BTNReloadProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip title={toolTipTitle} color={toolTipColor}>
      <Button shape="round" size="small" {...props} icon={<TfiReload />} />
    </Tooltip>
  );
};

export default BTNReload;
