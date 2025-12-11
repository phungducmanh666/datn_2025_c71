import { Button, ButtonProps, Dropdown, MenuProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { CiMenuKebab } from "react-icons/ci";

interface BTNDropDownProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
  items: MenuProps["items"];
}

const BTNDropDown: React.FC<BTNDropDownProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  children,
  items,
  ...props
}) => {
  return (
    <Tooltip title={toolTipTitle} color={toolTipColor}>
      <Dropdown menu={{ items }}>
        <Button
          variant="solid"
          color="blue"
          size="small"
          icon={<CiMenuKebab />}
          iconPosition="end"
          {...props}
        >
          {children ? children : "Tùy chọn"}
        </Button>
      </Dropdown>
    </Tooltip>
  );
};

export default BTNDropDown;
