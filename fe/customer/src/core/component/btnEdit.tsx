import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { AiFillEdit } from "react-icons/ai";

interface BTNEditProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNEdit: React.FC<BTNEditProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Chỉnh sửa"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        variant="solid"
        color="blue"
        shape="round"
        size="small"
        {...props}
        icon={icon ? icon : <AiFillEdit />}
      />
    </Tooltip>
  );
};

export default BTNEdit;
