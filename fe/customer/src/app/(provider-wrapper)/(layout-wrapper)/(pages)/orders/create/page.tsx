"use client";

import BTNMinus from "@component/btnMinus";
import BTNPlus from "@component/btnPlus";
import DeleveryAddress, { DeliveryInfo } from "@component/deliveryAddress";
import ImageSever from "@component/imageServer";
import ProductPriceInfo, { calculatePriceInfo } from "@component/infoPrice";
import InputCurrency from "@component/inputCurrency";
import OrderTotalAmountDisplay from "@component/orderTotalAmountDisplay";
import { getToastApi } from "@context/toastContext";
import { CreateOrderItemRequest, CreateOrderRequest } from "@data/orderData";
import { ProductData } from "@data/productData";
import { PromotionDetailRES } from "@data/promotionData";
import { useCreateOrder } from "@hook/orderHook/orderHook";
import { useCreatePaymentOrder } from "@hook/orderHook/paymentHook";
import { useProductsByIds } from "@hook/productHook/productHook";
import { PromotionAPI } from "@net/promotionNet/promotion";
import { ConvertUtil } from "@util/convertUtil";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Button, Col, Flex, Form, Radio, Row, Table } from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import _ from "lodash";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface ProductSelected extends ProductData {
  quantity: number;
  finalPrice: number;
  discountId: number;
  promotionId: number;
}
// #region detail

// Interface cho cấu trúc dữ liệu form

interface OrderFormValues {
  note?: string; // Ghi chú có thể không có
  paymentMethod: string;
}

interface PageOrderDetailProps {
  productUUIDS: string[];
}

const PageOrderDetail: React.FC<PageOrderDetailProps> = ({ productUUIDS }) => {
  const router = useRouter();
  const [form] = Form.useForm<OrderFormValues>(); // Sử dụng Form hook
  const [customerUUID, setCustomerUUID] = useState<string>();

  useEffect(() => {
    const customer = LocalStorageUtil.getCustomer();
    setCustomerUUID(customer?.uuid);
  }, []);

  const { data: products, isFetching: loading } =
    useProductsByIds(productUUIDS);
  const [selectedProducts, setSelectedProducts] = useState<ProductSelected[]>(
    []
  );

  const handleProductSelected = useCallback(
    async (products: ProductData[]) => {

      const newProductsToProcess = products.filter(
        (p) => !selectedProducts.some((sp) => sp.uuid === p.uuid)
      );
      if (newProductsToProcess.length === 0) return;

      const processedProducts = await Promise.all(
        newProductsToProcess.map(async (product) => {
          let finalPrice = product.price; // Mặc định là giá gốc
          let discountId = -1;
          let promotionId = -1;

          try {
            const discounts: PromotionDetailRES[] = await PromotionAPI.getProductDiscounts(product.uuid);

            if (discounts && discounts.length > 0) {
              const { finalPrice: caculaterPrice, promotionId: pid, discountId: did } = calculatePriceInfo(product, discounts);
              finalPrice = caculaterPrice;
              discountId = did;
              promotionId = pid;
            }
          } catch (error) {
            console.error(`Lỗi khi lấy khuyến mãi cho SP ${product.uuid}`, error);
          }// Trả về object sản phẩm đã có field finalPrice
          return {
            ...product,
            quantity: 1,
            finalPrice: finalPrice,
            discountId: discountId,
            promotionId: promotionId
          };
        })
      );

      setSelectedProducts((prev) => [...prev, ...processedProducts]);
    },
    [selectedProducts]
  );

  useEffect(() => {
    if (products && products?.length > 0) {
      handleProductSelected(products);
    }
  }, [products]);

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
    const finalValue = Math.max(value || 1, 1);
    debouncedUpdateQuantity(uuid, finalValue);
  };

  const handleQuantityChange2 = (uuid: string, value: number | null) => {
    const finalValue = Math.max(value || 1, 1);
    updateQuantity(uuid, finalValue);
  };

  const totalAmount = useMemo(() => {
    return selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.price,
      0
    );
  }, [selectedProducts]);

  const { mutate: createPaymentOrder, isPending: createPaymentLoading } =
    useCreatePaymentOrder();

  const { mutate: createMutate, isPending: creating } = useCreateOrder(
    (order) => {
      const paymentMethod = form.getFieldValue("paymentMethod");
      if (paymentMethod === "ZALO_PAY") createPaymentOrder(order.uuid);
      else router.push(`/orders/${order.uuid}`);
    }
  );

  const [orderPriceInfo, setOrderPriceInfo] = useState<{ totalAmount: number, totalSaved: number, orderDiscountIds: number[] }>();

    const handleDiscountDataChange = useCallback(({ finalPrice, totalSaved, appliedPromotionConditionIds }: {
    totalSaved: number; // Tổng tiền tiết kiệm (orderTotalAmount - finalPrice)
    totalOrderDiscountAmount: number; // Chỉ giảm từ khuyến mãi đơn hàng
    appliedPromotionConditionIds: number[];
    finalPrice: number;
  }) => {
    setOrderPriceInfo({
      totalAmount,
      totalSaved,
      orderDiscountIds: appliedPromotionConditionIds
    });
  }, [totalAmount]);

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | undefined>();

  // Xử lý khi Form submit thành công
  const onFinish = (values: OrderFormValues) => {

        if (!orderPriceInfo) {
      getToastApi().error("Chưa cập nhật tiền giảm giá");
      return;
    }

    if (selectedProducts.length === 0) {
      getToastApi().error("Giỏ hàng rỗng. Vui lòng chọn sản phẩm.");
      return;
    }

    if (
      !!!deliveryInfo ||
      !!!deliveryInfo.name ||
      !!!deliveryInfo.phoneNumber ||
      !!!deliveryInfo.address?.fullName
    ) {
      getToastApi().error("Vui lòng cập nhật thông tin nhận hàng");
      return;
    }

    const { note, paymentMethod } = values;

    const productsToSave: CreateOrderItemRequest[] = selectedProducts.map(
      (product) => ({
      productUUID: product.uuid,
        number: product.quantity,
        unitPrice: product.price,
        finalPrice: product.finalPrice,
        discountId: product.discountId
      })
    );

    const payload: CreateOrderRequest = {
      note,
      customerUUID: customerUUID!,
      paymentMethod,
      totalAmount: orderPriceInfo.totalAmount,
      totalSaved: orderPriceInfo.totalSaved,
      discountIds: orderPriceInfo.orderDiscountIds,
      deliveryInfo: {
        recipientName: deliveryInfo.name,
        recipientPhoneNumber: deliveryInfo.phoneNumber,
        deliveryAddress: deliveryInfo.address.fullName,
      },
      items: productsToSave,
    };

    createMutate(payload);
  };

  const columns = useMemo(() => {
    // ... (Giữ nguyên columns)
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
      title: "Đơn giá",
        key: "price",
        render: (_: any, record: ProductSelected) => {
          return <ProductPriceInfo product={record} />
        }
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        render: (quantity: number, record: ProductSelected) => (
          <Flex gap={10}>
            <BTNMinus
              disabled={quantity == 1}
              onClick={() => handleQuantityChange2(record.uuid, quantity - 1)}
            />
            <InputCurrency
              size="small"
              showCurrencySymbol={false}
              min={1}
              defaultValue={quantity}
              value={quantity}
              onChange={(value) => handleQuantityChange(record.uuid, value)}
              style={{ width: 100 }}
            />
            <BTNPlus
              onClick={() => handleQuantityChange2(record.uuid, quantity + 1)}
            />
          </Flex>
        ),
      },
      {
        title: "Thành tiền",
        key: "amount",
        render: (_: any, record: ProductSelected) => {
          // Tính toán tổng tiền
          const originalAmount = record.quantity * record.price;
          const realAmount = record.quantity * record.finalPrice;

          // Kiểm tra xem có sự chênh lệch giá không (có khuyến mãi không)
          const hasDiscount = realAmount < originalAmount;

          return (
            <div className="flex flex-col items-end justify-center gap-0.5">
              {hasDiscount ? (
                <>
                  {/* Giá thực tế: Lớn, đậm, màu đỏ để nổi bật */}
                  <span className="text-base font-bold text-red-600">
                    {ConvertUtil.formatVNCurrency(realAmount)}
                  </span>
                  {/* Giá gốc: Nhỏ, màu xám, gạch ngang */}
                  <span className="text-xs text-gray-400 line-through decoration-gray-400">
                    {ConvertUtil.formatVNCurrency(originalAmount)}
                  </span>
                </>
              ) : (
                /* Trường hợp không giảm giá: Hiển thị đậm màu tối */
                <span className="text-sm font-semibold text-gray-700">
                  {ConvertUtil.formatVNCurrency(originalAmount)}
                </span>
              )}
            </div>
          );
        },
      },
    ];
  }, [handleQuantityChange]);

  const paymentMethodOptions = [
    { value: "COD", label: "COD (Thanh toán khi nhận hàng)" },
    { value: "ZALO_PAY", label: "ZaloPay" },
  ];

    const totalDiscountAmount = useMemo(() => {
    return selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.finalPrice,
      0
    );
  }, [selectedProducts]);

  return (
    // Bọc toàn bộ nội dung trong Form component
    <Form
      form={form}
      initialValues={{ paymentMethod: "ZALO_PAY" }} // Đặt giá trị mặc định
      onFinish={onFinish} // Xử lý submit
      layout="vertical" // Dùng layout vertical cho Form.Item
    >
      <Flex vertical gap={40}>
        <Row gutter={[40, 10]}>
          <Col xl={{ span: 16 }}>
            <Flex vertical gap={40}>
              <Flex vertical gap={10}>
                <Title level={5}>Sản phẩm</Title>
                <Table
                  size="small"
                  rowKey="uuid"
                  columns={columns}
                  dataSource={selectedProducts}
                  pagination={false}
                  style={{ marginTop: 10 }}
                />
              </Flex>
              <Flex justify="space-between" align="flex-start" className="py-2">
                <OrderTotalAmountDisplay onDiscountDataChange={handleDiscountDataChange} orderTotalAmount={totalAmount} orderTotalAmountAfterDiscountProducts={totalDiscountAmount} />
              </Flex>
            </Flex>
          </Col>
          <Col xl={{ span: 8 }}>
            <Flex vertical gap={40}>
              <Form.Item
                label={<Title level={5}>Phương thức thanh toán</Title>}
                name="paymentMethod"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn phương thức thanh toán!",
                  },
                ]}
                // Bỏ noStyle để Form.Item tự quản lý khoảng cách và label
              >
                <Radio.Group options={paymentMethodOptions} />
              </Form.Item>

              <Form.Item name="note" label={<Title level={5}>Ghi chú</Title>}>
                <TextArea placeholder="Nhập ghi chú" rows={4} />{" "}
              </Form.Item>
              <Flex vertical gap={10}>
                <Title level={4}>Thông tin giao hàng</Title>
                <div style={{ marginLeft: 20 }}>
                  <DeleveryAddress onChange={(d) => setDeliveryInfo(d)} />
                </div>
              </Flex>
            </Flex>
          </Col>
        </Row>

        <Flex justify="end">
          {/* Nút submit form, sử dụng htmlType="submit" */}
          <Button type="primary" htmlType="submit" loading={creating}>
            Tiếp
          </Button>
        </Flex>
      </Flex>
    </Form>
  );
};

// #endregion

// #region page
interface PageOrderProps {}

const PageOrder: React.FC<PageOrderProps> = ({}) => {
  const [productUUIDS, setProductUUIDS] = useState<string[]>([]);

  useEffect(() => {
    // Đảm bảo LocalStorageUtil.getOrderProductUUIDS() trả về mảng string
    const uuids = LocalStorageUtil.getOrderProductUUIDS();
    if (Array.isArray(uuids)) {
      setProductUUIDS(uuids);
    }
  }, []);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [{ title: "Trang chủ", href: "/home" }, { title: "Đặt hàng" }],
    []
  );

  return (
    <Flex vertical gap={40}>
      <Breadcrumb items={breadCrumbItems} />

      <Title level={2}>Đặt hàng</Title>

      {productUUIDS?.length > 0 ? (
        <PageOrderDetail productUUIDS={productUUIDS} />
      ) : (
        <p>Không có sản phẩm nào được chọn.</p>
      )}
    </Flex>
  );
};

export default PageOrder;
// #endregion
