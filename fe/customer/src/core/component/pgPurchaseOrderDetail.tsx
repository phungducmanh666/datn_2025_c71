"use client";

import ImageSever from "@component/imageServer";
import { PurchaseOrderData } from "@data/warehouseData";
import { usePurchaseOrderProducts } from "@hook/warehouseHook/purchaseOrderHook";
import { ConvertUtil } from "@util/convertUtil";
import { Descriptions, DescriptionsProps, Flex, Table } from "antd";
import Title from "antd/es/typography/Title";
import { useMemo } from "react";

interface PGPurchaseOrderDetailProps {
  purchaseOrder: PurchaseOrderData;
}

const PGPurchaseOrderDetail: React.FC<PGPurchaseOrderDetailProps> = ({
  purchaseOrder: data,
}) => {
  const { data: products, isFetching: loading } = usePurchaseOrderProducts(
    data.items
  );

  const desItems = useMemo(
    (): DescriptionsProps["items"] =>
      data
        ? [
            {
              key: 1,
              label: "UUID",
              children: data.uuid,
            },
            {
              key: 2,
              label: "Nhà cung cấp",
              children: data.supplierName,
            },
            {
              key: 3,
              label: "Ngày đặt hàng",
              children: ConvertUtil.convertVietNamDateTime(data.orderDate),
            },
            {
              key: 4,
              label: "Trạng thái",
              children: ConvertUtil.getPurchaseOrderStatusLabel(data.status),
            },
          ]
        : [],
    [data]
  );

  const productColumns = useMemo(
    () => [
      {
        title: "Hình ảnh",
        dataIndex: "photoUrl",
        key: "photo",
        render: (photoUrl: string) => (
          <ImageSever size={"small"} src={photoUrl} />
        ),
      },
      {
        title: "Tên sản phẩm",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Số lượng đặt",
        dataIndex: "numberOrder",
        key: "numberOrder",
        render: (number: number) => ConvertUtil.formatVNNumber(number),
      },
      {
        title: "Số lượng đã nhận",
        dataIndex: "numberReceived",
        key: "numberReceived",
        render: (number: number) => ConvertUtil.formatVNNumber(number),
      },
    ],
    []
  );

  return (
    <>
      <Flex vertical gap={40}>
        <Flex vertical gap={5}>
          <Title level={5}>Thông tin đơn hàng</Title>
          <Descriptions
            size="small"
            bordered
            layout="horizontal"
            column={1}
            items={desItems}
          />
        </Flex>

        <Table
          title={() => <Title level={5}>{"Sản phẩm"}</Title>}
          size="small"
          dataSource={products}
          columns={productColumns}
          loading={loading}
          rowKey="key"
          pagination={false}
        />
      </Flex>
    </>
  );
};

export default PGPurchaseOrderDetail;
