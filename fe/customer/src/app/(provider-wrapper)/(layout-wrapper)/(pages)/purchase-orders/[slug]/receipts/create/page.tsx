"use client";

import BTNSave from "@component/btnSave";
import ImageSever from "@component/imageServer";
import InputCurrency from "@component/inputCurrency";
import { getToastApi } from "@context/toastContext";
import { ProductData } from "@data/productData";
import {
  useCreatePurchaseOrderReceipt,
  usePurchaseOrder,
  usePurchaseOrderProducts,
} from "@hook/warehouseHook/purchaseOrderHook";
import { useWarehouses } from "@hook/warehouseHook/warehouseHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  Row,
  Select,
  Table,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import Title from "antd/es/typography/Title";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface PagePurchaseOrderProps {}

interface PurchaseOrderProduct extends ProductData {
  numberOrder: number;
  numberReceived: number;
}

const PagePurchaseOrder: React.FC<PagePurchaseOrderProps> = ({}) => {
  const router = useRouter();
  const [warehouseUUID, setwarehouseUUID] = useState<string | null>(null);

  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching: loadingPurchaseOrder } = usePurchaseOrder(uuid);
  const { data: products, isFetching: loadingProducts } =
    usePurchaseOrderProducts(data?.items ? data.items : []);

  const { mutate: createReceipt, isPending: isCreatingReceipt } =
    useCreatePurchaseOrderReceipt(() =>
      router.push(`/purchase-orders/${uuid}`)
    );

  const { data: warehouses, isFetching: loadingWarehouses } = useWarehouses({
    sort: "name,ASC",
  });

  useEffect(() => {
    if (!warehouseUUID && warehouses?.items && warehouses.items.length > 0) {
      setwarehouseUUID(warehouses.items[0].uuid);
    }
  }, [warehouses, warehouseUUID]);

  const warehouseOptions = useMemo(() => {
    if (!warehouses?.items) return [];
    return warehouses.items.map((wh) => ({
      label: wh.name,
      value: wh.uuid,
    }));
  }, [warehouses?.items]);

  // State mới để lưu số lượng nhập cho từng sản phẩm
  const [receiveQuantities, setReceiveQuantities] = useState<{
    [key: string]: number;
  }>({});

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

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Đơn đặt hàng", href: "/purchase-orders" },
          { title: "Chi tiết đơn đặt hàng", href: `/purchase-orders/${uuid}` },
          { title: "Nhập hàng" },
        ]
      : [];
  }, [data]);

  // Hàm xử lý khi số lượng nhập thay đổi
  const handleQuantityChange = (productUuid: string, value: number) => {
    setReceiveQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productUuid]: value,
    }));
  };

  const productColumns = useMemo(
    () => [
      {
        title: "Hình ảnh",
        dataIndex: "photoUrl",
        key: "photo",
        render: (photoUrl: string) => (
          <ImageSever size={"medium"} src={photoUrl} />
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
      },
      {
        title: "Số lượng đã nhận",
        dataIndex: "numberReceived",
        key: "numberReceived",
      },
      {
        title: "Số lượng nhập",
        key: "receiveQuantity",
        render: (record: PurchaseOrderProduct) => (
          <InputCurrency
            showCurrencySymbol={false}
            min={1}
            defaultValue={receiveQuantities[record.uuid] || 0}
            onChange={(value) => handleQuantityChange(record.uuid, value!)}
          />
        ),
      },
    ],
    [receiveQuantities]
  );

  const handleCreate = () => {
    if (!warehouseUUID) {
      getToastApi().error("Chưa chọn kho");
      return;
    }
    if (!uuid) {
      getToastApi().error("Đơn đặt hàng không hợp lệ");
      return;
    }
    if (Object.keys(receiveQuantities).length === 0) {
      getToastApi().error("Chưa có sản phẩm nào được nhập");
      return;
    }

    if (Object.values(receiveQuantities).some((quantity) => quantity <= 0)) {
      getToastApi().error("Số lượng nhập phải lớn hơn 0");
      return;
    }

    const payload = {
      warehouseUUID: warehouseUUID,
      purchaseOrderUUID: uuid,
      items: Object.entries(receiveQuantities).map(
        ([productUUID, quantity]) => ({
          productUUID,
          quantity,
        })
      ),
    };

    createReceipt(payload);
  };

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Descriptions
          title={"Thông tin đơn đặt hàng"}
          size="small"
          bordered
          layout="horizontal"
          column={1}
          items={desItems}
        />

        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col
            xl={{ span: 8 }}
            lg={{ span: 12 }}
            md={{ span: 24 }}
            sm={{ span: 24 }}
            xs={{ span: 24 }}
          >
            <Flex vertical gap={5}>
              <Title level={5}>Chọn kho</Title>
              <Select
                style={{ width: "100%" }}
                value={warehouseUUID}
                onChange={(value: string) => setwarehouseUUID(value)}
                options={warehouseOptions}
                loading={loadingWarehouses}
              />
            </Flex>
          </Col>
        </Row>

        <Table
          title={() => <Title level={5}>Sản phẩm</Title>}
          size="small"
          dataSource={products}
          columns={productColumns}
          loading={loadingPurchaseOrder || loadingProducts}
          rowKey="key"
          pagination={false}
        />
        <Flex justify="end">
          <BTNSave onClick={handleCreate} loading={isCreatingReceipt} />
        </Flex>
      </Flex>
    </>
  );
};

export default PagePurchaseOrder;
