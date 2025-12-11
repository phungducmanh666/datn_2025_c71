"use client";

import BTNDropDown from "@component/btnDropDown";
import IFWarehouse from "@component/ifWarehouse";
import PGPurchaseOrderDetail from "@component/pgPurchaseOrderDetail";
import { ProductData } from "@data/productData";
import { PurchaseOrderReceiptData } from "@data/warehouseData";
import {
  PurchaseOrderReceiptProduct,
  usePurchaseOrder,
  usePurchaseOrderReceiptProducts,
  usePurchaseOrderReceipts,
} from "@hook/warehouseHook/purchaseOrderHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Collapse,
  DescriptionsProps,
  Flex,
  MenuProps,
  Spin,
  Typography,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import Table, { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

//#region receipt

interface PurchaseReceiptDetailProps {
  receipt: PurchaseOrderReceiptData;
}

const PurchaseReceiptDetail: React.FC<PurchaseReceiptDetailProps> = ({
  receipt,
}) => {
  const { data, isFetching } = usePurchaseOrderReceiptProducts(receipt.items);

  const productColumns: ColumnsType<PurchaseOrderReceiptProduct> = useMemo(
    () => [
      {
        title: "Tên sản phẩm",
        dataIndex: "name",
        key: "name",
        render: (name: string, r: PurchaseOrderReceiptProduct) => (
          <Flex vertical gap={10}>
            <Typography>{name}</Typography>
          </Flex>
        ),
      },
      {
        title: "Số lượng nhập",
        dataIndex: "number",
        key: "number",
        width: 150,
        render: (number) => (
          <Typography>{ConvertUtil.formatVNNumber(number)}</Typography>
        ),
      },
    ],
    []
  );

  // Nội dung của Collapse, có thể là bảng hoặc một component khác
  const collapseContent = useMemo(() => {
    if (isFetching) {
      return (
        <Flex justify="center" style={{ padding: "20px" }}>
          <Spin />
        </Flex>
      );
    }

    return (
      <Table
        columns={productColumns}
        dataSource={data}
        rowKey="uuid"
        pagination={false}
      />
    );
  }, [isFetching, data, productColumns]);

  const header = useMemo(() => {
    const formattedDate = ConvertUtil.convertVietNamDateTime(
      receipt.receiptDate
    );
    const warehouseName = <IFWarehouse uuid={receipt.warehouseUUID} />;

    return (
      <Flex justify="space-between" align="center">
        <Typography>Ngày nhập: {formattedDate}</Typography>
        <Typography>Kho: {warehouseName}</Typography>
      </Flex>
    );
  }, [receipt]);

  return (
    <Collapse bordered={false} defaultActiveKey={["1"]}>
      <Collapse.Panel key="1" header={header}>
        {collapseContent}
      </Collapse.Panel>
    </Collapse>
  );
};
//#endregion

//#region receipts
interface PurchaseOrderReceiptsProps {
  purchaseOrderUUID: string;
}

const PurchaseOrderReceipts: React.FC<PurchaseOrderReceiptsProps> = ({
  purchaseOrderUUID,
}) => {
  const { data, isFetching } = usePurchaseOrderReceipts(purchaseOrderUUID);

  return (
    <Flex vertical gap={10}>
      <Title level={5}>Phiếu nhập</Title>
      {isFetching ? (
        <Flex justify="center">
          <Spin size="large" />
        </Flex>
      ) : data && data?.length > 0 ? (
        data.map((receipt) => (
          <PurchaseReceiptDetail key={receipt.uuid} receipt={receipt} />
        ))
      ) : (
        <Typography>Không có phiếu nhập nào.</Typography>
      )}
    </Flex>
  );
};

//#endregion

//#region page

interface PagePurchaseOrderProps {}

interface PurchaseOrderProduct extends ProductData {
  numberOrder: number;
  numberReceived: number;
}

const PagePurchaseOrder: React.FC<PagePurchaseOrderProps> = ({}) => {
  const router = useRouter();
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = usePurchaseOrder(uuid);

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

  const menuItems = useMemo(
    (): MenuProps["items"] => [
      {
        key: 1,
        label: (
          <Typography
            onClick={() =>
              router.push(`/purchase-orders/${uuid}/receipts/create`)
            }
          >
            Nhập hàng
          </Typography>
        ),
      },
    ],
    []
  );

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Đơn đặt hàng", href: "/purchase-orders" },
          { title: "Chi tiết đơn đặt hàng" },
        ]
      : [];
  }, [data]);

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        {data ? <PGPurchaseOrderDetail purchaseOrder={data} /> : <Spin />}

        <PurchaseOrderReceipts purchaseOrderUUID={uuid} />
        <Flex>
          <BTNDropDown items={menuItems} />
        </Flex>
      </Flex>
    </>
  );
};

export default PagePurchaseOrder;
//#endregion
