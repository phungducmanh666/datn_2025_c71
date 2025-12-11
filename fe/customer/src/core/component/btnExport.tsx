import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import React from "react";
import { CgExport } from "react-icons/cg";

interface BTNExportProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNExport: React.FC<BTNExportProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Xuất"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        shape="round"
        type="primary"
        size="small"
        {...props}
        icon={<CgExport />}
      />
    </Tooltip>
  );
};

export default BTNExport;
