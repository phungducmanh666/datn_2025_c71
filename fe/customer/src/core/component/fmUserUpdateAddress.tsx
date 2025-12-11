import { useUpdateCustomerAddress } from "@hook/userHook/customerHook";
import { MapComponentRef } from "@util/datadefindnation";
import { Drawer, Flex, Modal } from "antd";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import BTNCancle from "./btnCancle";
import BTNEdit from "./btnEdit";
import BTNSave from "./btnSave";

const MapComponent = dynamic(() => import("@component/map"), {
  ssr: false,
});

interface FMUserUpdateAddressProps {
  customerUUID: string;
  open: boolean;
  onCancle: () => any;
  onSave: (address: string) => any;
}

const FMUserUpdateAddress: React.FC<FMUserUpdateAddressProps> = ({
  customerUUID,
  open,
  onCancle,
  onSave,
}) => {
  const [address, setAddress] = useState<string>("");
  const [openMap, setOpenMap] = useState<boolean>(false);

  const mapRef = useRef<MapComponentRef>(null);

  useEffect(() => {
    if (open && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.getMap()?.invalidateSize();
      }, 300);
    }
  }, [openMap]);

  const handleSelectAddress = () => {
    setOpenMap(false);
    if (mapRef.current) {
      const addr = mapRef.current.getAddressInfo()?.displayName || "";
      setAddress(addr);
    }
  };

  const { mutate: updateMutate, isPending } = useUpdateCustomerAddress(() =>
    onSave?.(address)
  );

  const handleSave = () => {
    if (address) {
      updateMutate({ uuid: customerUUID, address });
      return;
    }
    onCancle?.();
  };

  return (
    <Modal
      open={open}
      title="Cập nhật địa chỉ"
      onCancel={() => onCancle?.()}
      footer={[
        <BTNSave
          key="save"
          type="primary"
          onClick={handleSave}
          loading={isPending}
        >
          Lưu
        </BTNSave>,
        <BTNCancle key="cancel" onClick={() => onCancle()}>
          Đóng
        </BTNCancle>,
      ]}
      destroyOnHidden
    >
      <Flex gap={10} wrap>
        <Flex gap={10}>
          <strong style={{ width: 300 }}>Địa chỉ giao hàng: </strong>
          {address ? address : "Chưa có"}
        </Flex>
        <BTNEdit
          size="small"
          toolTipTitle="Chọn địa chỉ giao hàng"
          onClick={() => setOpenMap(true)}
        />
      </Flex>
      <Drawer
        onClose={handleSelectAddress}
        open={openMap}
        placement="bottom"
        height={"100vh"}
      >
        <MapComponent ref={mapRef} />
      </Drawer>
    </Modal>
  );
};

export default FMUserUpdateAddress;
