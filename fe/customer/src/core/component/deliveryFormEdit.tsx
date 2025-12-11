import { MapComponentRef } from "@util/datadefindnation";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Drawer, Flex, Form, Input, Modal } from "antd";
import { useForm } from "antd/es/form/Form";
import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
import BTNCancle from "./btnCancle";
import BTNEdit from "./btnEdit";
import BTNSave from "./btnSave";
import { DeliveryInfo } from "./deliveryAddress";

const MapComponent = dynamic(() => import("@component/map"), {
  ssr: false,
});

interface FMDeliveryEditProps {
  open: boolean;
  onCancle: () => any;
}

interface FormData {
  name: string;
  phoneNumber: string;
}

const FMDeliveryEdit: React.FC<FMDeliveryEditProps> = ({ open, onCancle }) => {
  const [form] = useForm<FormData>();
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [openMap, setOpenMap] = useState<boolean>(false);

  const mapRef = useRef<MapComponentRef>(null);

  useEffect(() => {
    if (open && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.getMap()?.invalidateSize();
      }, 300);
    }
  }, [openMap]);

  useEffect(() => {
    setDeliveryInfo(LocalStorageUtil.getDeliveryInfo());
  }, []);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const { name, phoneNumber } = values;
        let newDelivery: DeliveryInfo = { name, phoneNumber };
        if (deliveryInfo) {
          newDelivery = {
            ...deliveryInfo,
            name,
            phoneNumber,
          };
        }
        LocalStorageUtil.setDeliveryInfo(newDelivery);
        setDeliveryInfo(newDelivery);
        onCancle?.();
      })
      .catch(() => {
        console.log("Form chưa hợp lệ");
      });
  };

  const handleSelectAddress = () => {
    setOpenMap(false);
    if (mapRef.current) {
      const position = mapRef.current.getPosition();
      const address = mapRef.current.getAddressInfo()
        ? mapRef.current.getAddressInfo()?.displayName
        : "";
      const delivery = LocalStorageUtil.getDeliveryInfo();
      let newDelivery: DeliveryInfo = {};
      if (delivery) {
        newDelivery = { ...delivery };
      }
      if (newDelivery) {
        newDelivery = {
          ...newDelivery,
          address: {
            fullName: address!,
            lat: position?.lat,
            lng: position?.lng,
          },
        };
      }
      setDeliveryInfo(newDelivery);
    }
  };

  return (
    <Modal
      open={open}
      title="Thông tin giao hàng"
      onCancel={onCancle}
      footer={[
        <BTNSave key="save" type="primary" onClick={handleSave}>
          Lưu
        </BTNSave>,
        <BTNCancle key="cancel" onClick={onCancle}>
          Đóng
        </BTNCancle>,
      ]}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: deliveryInfo?.name || "",
          phoneNumber: deliveryInfo?.phoneNumber || "",
        }}
      >
        <Form.Item
          label="Họ và tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^[0-9]{10,11}$/,
              message: "Số điện thoại không hợp lệ",
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Flex gap={10} wrap>
          <Flex gap={10}>
            <strong style={{ width: 300 }}>Địa chỉ giao hàng: </strong>
            {deliveryInfo?.address?.fullName
              ? deliveryInfo.address.fullName
              : "Chưa có"}
          </Flex>
          <BTNEdit
            size="small"
            toolTipTitle="Chọn địa chỉ giao hàng"
            onClick={() => setOpenMap(true)}
          />
        </Flex>
      </Form>
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

export default FMDeliveryEdit;
