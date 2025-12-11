"use client";

import BTNMinus from "@component/btnMinus";
import BTNPlus from "@component/btnPlus";
import BTNSave from "@component/btnSave";
import ImageSever from "@component/imageServer";
import InputCurrency from "@component/inputCurrency";
import { getToastApi } from "@context/toastContext";
import { ProductData } from "@data/productData";
import { PurchaseOrderItemData } from "@data/warehouseData";
import {
  useCreatePurchaseOrderReceipt,
  usePurchaseOrder,
  usePurchaseOrderProducts,
} from "@hook/warehouseHook/purchaseOrderHook";
import { ConvertUtil } from "@util/convertUtil";
import { Col, Descriptions, DescriptionsProps, Flex, Row, Table } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import _ from "lodash";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

interface PagePurchaseOrderProps { }

interface PurchaseOrderProduct extends ProductData {
  numberOrder: number;
  numberReceived: number;
}

const PagePurchaseOrder: React.FC<PagePurchaseOrderProps> = ({ }) => {
  const router = useRouter();
  const [note, setNote] = useState<string>();

  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching: loadingPurchaseOrder } = usePurchaseOrder(uuid);
  const { data: products, isFetching: loadingProducts } =
    usePurchaseOrderProducts(data?.items ? data.items : []);

  const { mutate: createReceipt, isPending: isCreatingReceipt } =
    useCreatePurchaseOrderReceipt(() =>
      router.push(`/purchase-orders/${uuid}`)
    );

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
            children: data.supplier.name,
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

  const debouncedUpdateQuantity = useRef(
    _.debounce((uuid: string, value: number) => {
      updateQuantity(uuid, value);
    }, 500)
  ).current;

  // Hàm xử lý khi số lượng nhập thay đổi
  const updateQuantity = (productUuid: string, value: number) => {
    setReceiveQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productUuid]: value,
    }));
  };

  const handleQuantityChange = (uuid: string, value: number | null) => {
    debouncedUpdateQuantity(uuid, value || 0);
  };

  const handleQuantityChange2 = (uuid: string, value: number | null) => {
    updateQuantity(uuid, value || 0);
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
        dataIndex: "orderNumber",
        key: "orderNumber",
      },
      {
        title: "Số lượng nhập",
        key: "receiveQuantity",
        render: (record: PurchaseOrderItemData) => (
          <Flex gap={10}>
            <BTNMinus
              disabled={receiveQuantities[record.uuid] <= 0}
              onClick={() => handleQuantityChange2(record.uuid, receiveQuantities[record.uuid] - 1)}
            />
            <InputCurrency
              size="small"
              showCurrencySymbol={false}
              min={1}
              value={receiveQuantities[record.uuid] || 0}
              onChange={(value) => handleQuantityChange(record.uuid, value)}
            />
            <BTNPlus
              disabled={receiveQuantities[record.uuid] >= record.orderNumber}
              onClick={() => handleQuantityChange2(record.uuid, receiveQuantities[record.uuid] + 1)}
            />
          </Flex>

        ),
      },
    ],
    [receiveQuantities]
  );

  const handleCreate = () => {
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
      purchaseOrderUUID: uuid,
      note: note,
      items: Object.entries(receiveQuantities).map(
        ([productUUID, quantity]) => ({
          productUUID,
          number: quantity,
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

        <Table
          title={() => <Title level={5}>Sản phẩm</Title>}
          size="small"
          dataSource={products}
          columns={productColumns}
          loading={loadingPurchaseOrder || loadingProducts}
          rowKey="key"
          pagination={false}
        />
        <Row>
          <Col md={{ span: 12 }} xs={{ span: 24 }}>
            <Flex vertical gap={5}>
              <Title level={5}>Ghi chú</Title>
              <TextArea
                placeholder="Nhập ghi chú"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Flex>
          </Col>
        </Row>

        <Flex justify="end">
          <BTNSave onClick={handleCreate} loading={isCreatingReceipt} />
        </Flex>
      </Flex>
    </>
  );
};

export default PagePurchaseOrder;
