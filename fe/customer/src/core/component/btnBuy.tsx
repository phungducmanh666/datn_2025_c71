import { LocalStorageUtil } from "@util/localStorageUtil";
import { Button, ButtonProps, Tooltip } from "antd";
import { PresetColorType } from "antd/es/_util/colors";
import { LiteralUnion } from "antd/es/_util/type";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiCreditCard1 } from "react-icons/ci";

interface BTNBuyProps extends ButtonProps {
  toolTipTitle?: string;
  toolTipColor?: LiteralUnion<PresetColorType>;
  productUUID?: string;
}

const BTNBuy: React.FC<BTNBuyProps> = ({
  toolTipTitle,
  toolTipColor,
  productUUID,
  icon,
  ...props
}) => {
  const router = useRouter();
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const tk = LocalStorageUtil.getToken();
    setToken(tk || "");
  }, []);

  return (
    <Tooltip
      title={toolTipTitle ? toolTipTitle : "Mua ngay"}
      color={toolTipColor ? toolTipColor : "red"}
    >
      <Button
        variant="solid"
        color="danger"
        size="small"
        {...props}
        icon={<CiCreditCard1 />}
        onClick={() => {
          if (!token) {
            router.push("/login");
            return;
          }
          if (!productUUID) return;

          LocalStorageUtil.clearOrderProductUUIDS();
          LocalStorageUtil.addOrderProductUUID(productUUID);

          router.push(`/orders/create`);
        }}
      />
    </Tooltip>
  );
};

export default BTNBuy;
