"use client";

import ImageSever from "@component/imageServer";
import { PurchaseOrderData } from "@data/warehouseData";
import { usePurchaseOrderProducts } from "@hook/warehouseHook/purchaseOrderHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Card,
  Descriptions,
  DescriptionsProps,
  Flex,
  Table,
  theme,
} from "antd";
import Title from "antd/es/typography/Title";
import { useMemo } from "react";
import StaffInfo from "./staffInfo";

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
            label: "Mã đơn đặt hàng",
            children: ConvertUtil.formatUUID(data.uuid),
          },
          {
            key: 2,
            label: "Nhà cung cấp",
            children: data.supplier.name,
          },
          {
            key: 11,
            label: "Nhân viên",
            children: <StaffInfo uuid={data.staffUUID} />,
          },
          {
            key: 3,
            label: "Ngày đặt hàng",
            children: ConvertUtil.convertVietNamDate(data.createdAt),
          },
          {
            key: 4,
            label: "Trạng thái",
            children: ConvertUtil.getPurchaseOrderStatusLabel(
              data.receipt == null ? false : true
            ),
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
        dataIndex: "orderNumber",
        key: "orderNumber",
        render: (number: number) => ConvertUtil.formatVNNumber(number),
      },
      {
        title: "Số lượng đã nhận",
        dataIndex: "receiptNumber",
        key: "receiptNumber",
        render: (number: number) => ConvertUtil.formatVNNumber(number),
      },
    ],
    []
  );

  const { token } = theme.useToken();

  return (
    <>
      <Flex vertical gap={40}>
        <Flex vertical gap={5}>
          <Card title="Thông tin đơn đặt hàng">
            <Descriptions
              size="small"
              bordered={false}
              layout="horizontal"
              column={1}
              items={desItems}
              styles={{
                label: {
                  color: token.colorText,
                  fontWeight: "bold",
                },
              }}
            />
          </Card>
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
