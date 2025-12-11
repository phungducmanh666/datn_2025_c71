import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import { useRouter } from "next/navigation";
import React from "react";
import { CgShoppingCart } from "react-icons/cg";

interface BTNCartProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
}

const BTNCart: React.FC<BTNCartProps> = ({
  toolTipTitle,
  toolTipColor,
  icon,
  ...props
}) => {
  const router = useRouter();

  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Giỏ hàng"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        shape="round"
        type="primary"
        size="small"
        {...props}
        icon={<CgShoppingCart />}
        onClick={() => router.push("/carts")}
      />
    </Tooltip>
  );
};

export default BTNCart;
