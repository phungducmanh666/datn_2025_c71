import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { MdDelete } from "react-icons/md";

interface BTNDeleteProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNDelete: React.FC<BTNDeleteProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Xóa"}
      color={toolTipColor ? toolTipColor : "red"}
    >
      <Button
        variant="solid"
        color="danger"
        shape="round"
        size="small"
        {...props}
        icon={<MdDelete />}
      />
    </Tooltip>
  );
};

export default BTNDelete;
