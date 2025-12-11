"use client";

import BTNAdd from "@component/btnAdd";
import BTNDelete from "@component/btnDelete";
import BTNMinus from "@component/btnMinus";
import BTNPlus from "@component/btnPlus";
import BTNSave from "@component/btnSave";
import FMProductSelection from "@component/fmProductSelection";
import ImageSever from "@component/imageServer";
import InputCurrency from "@component/inputCurrency";
import { getToastApi } from "@context/toastContext";
import { ProductData } from "@data/productData";
import { useCreatePurchaseOrder } from "@hook/warehouseHook/purchaseOrderHook";
import { useSuppliers } from "@hook/warehouseHook/supplierHook";
import { Col, Flex, Popconfirm, Row, Select, Table } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import _ from "lodash";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface ProductSelected extends ProductData {
  quantity: number;
}

interface PageCreatePurchaseOrderProps { }

const PageCreatePurchaseOrder: React.FC<
  PageCreatePurchaseOrderProps
> = ({ }) => {
  const router = useRouter();
  const [supplierUUID, setSupplierUUID] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<ProductSelected[]>(
    []
  );
  const [openFormSelectProduct, setOpenFormSelectProduct] =
    useState<boolean>(false);

  const { data: supplierPage, isFetching: fetchingSuppliers } = useSuppliers({
    sort: "name,ASC",
  });

  const { mutate: createPurchaseOrder, isPending: creating } =
    useCreatePurchaseOrder((data) =>
      router.push(`/purchase-orders/${data.uuid}`)
    );

  useEffect(() => {
    if (!supplierUUID && supplierPage?.items && supplierPage.items.length > 0) {
      setSupplierUUID(supplierPage.items[0].uuid);
    }
  }, [supplierPage, supplierUUID]);

  const supplierOptions = useMemo(() => {
    if (!supplierPage?.items) return [];
    return supplierPage.items.map((supplier) => ({
      label: supplier.name,
      value: supplier.uuid,
    }));
  }, [supplierPage?.items]);

  const handleProductSelected = useCallback(
    (products: ProductData[]) => {
      const newProducts = products
        .filter((p) => !selectedProducts.some((sp) => sp.uuid === p.uuid))
        .map((p) => ({ ...p, quantity: 1 }));
      setSelectedProducts((prev) => [...prev, ...newProducts]);
    },
    [selectedProducts]
  );

  const updateQuantity = (uuid: string, value: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, quantity: value } : p))
    );
  };

  const debouncedUpdateQuantity = useRef(
    _.debounce((uuid: string, value: number) => {
      updateQuantity(uuid, value);
    }, 500)
  ).current;

  const handleQuantityChange = (uuid: string, value: number | null) => {
    debouncedUpdateQuantity(uuid, value || 0);
  };

  const handleQuantityChange2 = (uuid: string, value: number | null) => {
    updateQuantity(uuid, value || 0);
  };

  const handleRemoveProduct = useCallback((uuid: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.uuid !== uuid));
  }, []);

  const handleSave = useCallback(() => {
    if (!supplierUUID) {
      getToastApi().error("Vui lòng chọn nhà cung cấp trước khi lưu!");
      return;
    }

    if (selectedProducts.length === 0) {
      getToastApi().error("Vui lòng thêm sản phẩm trước khi lưu!");
      return;
    }

    const invalidProduct = selectedProducts.find(
      (product) => product.quantity <= 0
    );
    if (invalidProduct) {
      getToastApi().error(
        `Số lượng của sản phẩm '${invalidProduct.name}' phải lớn hơn 0!`
      );
      return;
    }

    const productsToSave = selectedProducts.map((product) => ({
      productUUID: product.uuid,
      quantity: product.quantity,
    }));

    const payload = { supplierUUID, note, items: productsToSave };
    createPurchaseOrder(payload);
  }, [supplierUUID, selectedProducts, note, createPurchaseOrder]);

  const columns = useMemo(() => {
    return [
      {
        title: "Hình ảnh",
        dataIndex: "photoUrl",
        key: "photo",
        render: (url: string) => (
          <ImageSever src={url} style={{ width: 50, height: 50 }} />
        ),
      },
      {
        title: "Tên sản phẩm",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        render: (quantity: number, record: ProductSelected) => (
          <Flex gap={10}>
            <BTNMinus
              disabled={quantity <= 1}
              onClick={() => handleQuantityChange2(record.uuid, quantity - 1)}
            />
            <InputCurrency
              size="small"
              showCurrencySymbol={false}
              min={1}
              value={quantity}
              onChange={(value) => handleQuantityChange(record.uuid, value)}
            />
            <BTNPlus
              onClick={() => handleQuantityChange2(record.uuid, quantity + 1)}
            />
          </Flex>
        ),
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_: any, record: ProductSelected) => (
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleRemoveProduct(record.uuid)}
            okText="Có"
            cancelText="Không"
          >
            <BTNDelete />
          </Popconfirm>
        ),
      },
    ];
  }, [handleQuantityChange, handleRemoveProduct]);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return [
      { title: "Trang chủ", href: "/home" },
      { title: "Đơn đặt hàng", href: "/purchase-orders" },
      { title: "Tạo đơn đặt hàng" },
    ];
  }, []);

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Row gutter={[40, 10]}>
          <Col xl={{ span: 16 }}>
            <Flex vertical gap={10}>
              <Table
                size="small"
                rowKey="uuid"
                columns={columns}
                dataSource={selectedProducts}
                pagination={false}
                style={{ marginTop: 10 }}
              />
              <Flex>
                <BTNAdd onClick={() => setOpenFormSelectProduct(true)}>
                  Thêm sản phẩm
                </BTNAdd>
              </Flex>
            </Flex>
          </Col>
          <Col xl={{ span: 8 }}>
            <Flex vertical gap={20}>
              <Flex vertical gap={5}>
                <Title level={5}>Chọn nhà cung cấp</Title>
                <Select
                  style={{ width: "100%" }}
                  value={supplierUUID}
                  onChange={(value: string) => setSupplierUUID(value)}
                  options={supplierOptions}
                  loading={fetchingSuppliers}
                />
              </Flex>
              <Flex vertical gap={5}>
                <Title level={5}>Ghi chú</Title>
                <TextArea
                  placeholder="Nhập ghi chú"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Flex>
            </Flex>
          </Col>
        </Row>

        <Flex justify="end">
          <BTNSave onClick={handleSave} loading={creating} />
        </Flex>
      </Flex>
      <FMProductSelection
        open={openFormSelectProduct}
        onCancle={() => setOpenFormSelectProduct(false)}
        onSelected={handleProductSelected}
      />
    </>
  );
};

export default PageCreatePurchaseOrder;
