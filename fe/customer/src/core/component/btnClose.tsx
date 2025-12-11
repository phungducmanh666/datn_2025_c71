import { Button, ButtonProps } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { CgClose } from "react-icons/cg";

interface BTNCloseProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNClose: React.FC<BTNCloseProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Button
      shape="round"
      size="small"
      variant="solid"
      color="danger"
      {...props}
      icon={<CgClose />}
    />
  );
};

export default BTNClose;
