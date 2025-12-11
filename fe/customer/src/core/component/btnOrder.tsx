import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import { useRouter } from "next/navigation";
import React from "react";
import { RiListOrdered } from "react-icons/ri";

interface BTNOrderProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNOrder: React.FC<BTNOrderProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  const router = useRouter();

  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Đơn hàng"}
      color={toolTipColor ? toolTipColor : "orange"}
    >
      <Button
        shape="round"
        variant="solid"
        color="orange"
        size="small"
        {...props}
        icon={<RiListOrdered />}
        onClick={() => router.push("/orders")}
      />
    </Tooltip>
  );
};

export default BTNOrder;
