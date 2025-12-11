import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { IoCreate } from "react-icons/io5";

interface BTNCreateProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNCreate: React.FC<BTNCreateProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Tạo mới"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        shape="round"
        type="primary"
        size="small"
        {...props}
        icon={<IoCreate />}
      />
    </Tooltip>
  );
};

export default BTNCreate;
