import { useAddToCart } from "@hook/orderHook/cartHook";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CgAdd } from "react-icons/cg";

interface BTNAddToCartProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
  productUUID?: string;
}

const BTNAddToCart: React.FC<BTNAddToCartProps> = ({
  toolTipTitle,
  toolTipColor,
  productUUID,
  icon,
  ...props
}) => {
  const router = useRouter();
  const [token, setToken] = useState<string>();

  const { mutate: addToCart, isPending } = useAddToCart(() => {});

  useEffect(() => {
    const tk = LocalStorageUtil.getToken();
    setToken(tk || "");
  }, []);

  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Thêm vào giỏ hàng"}
      color={toolTipColor ? toolTipColor : "blue"}
    >
      <Button
        loading={isPending}
        type="primary"
        size="small"
        {...props}
        icon={<CgAdd />}
        onClick={() => {
          if (!token) {
            router.push("/login");
            return;
          }
          if (!productUUID) return;
          addToCart(productUUID);
        }}
      />
    </Tooltip>
  );
};

export default BTNAddToCart;
