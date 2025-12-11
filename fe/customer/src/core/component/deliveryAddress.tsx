import { LocalStorageUtil } from "@util/localStorageUtil";
import { Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";
import BTNEdit from "./btnEdit";
import FMDeliveryEdit from "./deliveryFormEdit";

interface DeleveryAddressProps {
  dinfo?: DeliveryInfo;
  onChange?: (deliveryInfo: DeliveryInfo | undefined) => any;
}

export interface DeliveryInfo {
  name?: string;
  phoneNumber?: string;
  address?: {
    fullName?: string;
    lat?: number;
    lng?: number;
  };
}

const DeleveryAddress: React.FC<DeleveryAddressProps> = ({
  onChange,
  dinfo,
}) => {
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | undefined>(
    dinfo
  );
  const [openForm, setOpenForm] = useState<boolean>(false);

  useEffect(() => {
    setDeliveryInfo(LocalStorageUtil.getDeliveryInfo() || undefined);
  }, [openForm]);

  useEffect(() => {
    onChange?.(deliveryInfo);
  }, [deliveryInfo]);

  return (
    <>
      <Flex vertical gap={10} wrap>
        <BTNEdit
          toolTipTitle="Chỉnh sửa thông tin giao hàng"
          onClick={() => setOpenForm(true)}
        />
        {deliveryInfo ? (
          <Flex vertical gap={10}>
            <Flex gap={10}>
              <strong>Tên người nhận: </strong>
              {deliveryInfo.name}
            </Flex>
            <Flex gap={10}>
              <strong>Số điện thoại: </strong>
              {deliveryInfo.phoneNumber}
            </Flex>
            <Flex gap={10}>
              <strong>Địa chỉ giao hàng: </strong>
              {`${deliveryInfo.address?.fullName} (${deliveryInfo.address?.lat}, ${deliveryInfo.address?.lng})`}
            </Flex>
          </Flex>
        ) : (
          <Typography>Không có thông tin nhận hàng</Typography>
        )}
      </Flex>

      <FMDeliveryEdit open={openForm} onCancle={() => setOpenForm(false)} />
    </>
  );
};

export default DeleveryAddress;
