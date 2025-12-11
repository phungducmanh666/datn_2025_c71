"use client";

import BTNAdd from "@component/btnAdd";
import BTNDelete from "@component/btnDelete";
import BTNMinus from "@component/btnMinus";
import BTNPlus from "@component/btnPlus";
import FMProductSelection from "@component/fmProductSelection";
import ImageSever from "@component/imageServer";
import ProductPriceInfo, { calculatePriceInfo } from "@component/infoPrice";
import InputCurrency from "@component/inputCurrency";
import OrderTotalAmountDisplay from "@component/orderTotalAmountDisplay";
import { getToastApi } from "@context/toastContext";
import { CreateOrderItemRequest, CreateOrderRequest } from "@data/orderData";
import { ProductData } from "@data/productData";
import { PromotionDetailRES } from "@data/promotionData";
import { useCreateOrder } from "@hook/orderHook/orderHook";
import { PromotionAPI } from "@net/promotionNet/promotion";
import { ConvertUtil } from "@util/convertUtil";
import {
  Button,
  Col,
  Flex,
  Popconfirm,
  Radio,
  RadioChangeEvent,
  Row,
  Table,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import TextArea from "antd/es/input/TextArea";
import Title from "antd/es/typography/Title";
import _ from "lodash";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useRef, useState } from "react";

//#region order selection
interface ProductSelected extends ProductData {
  quantity: number;
  finalPrice: number;
  discountId: number;
  promotionId: number;
}

interface OrderPageProps { }

const OrderPage: React.FC<OrderPageProps> = ({ }) => {
  const router = useRouter();
  const [supplierUUID, setSupplierUUID] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("COD");
  const [selectedProducts, setSelectedProducts] = useState<ProductSelected[]>(
    []
  );
  const [openFormSelectProduct, setOpenFormSelectProduct] =
    useState<boolean>(false);

  const [orderPriceInfo, setOrderPriceInfo] = useState<{ totalAmount: number, totalSaved: number, orderDiscountIds: number[] }>();

  const paymentMethodOptions = [
    { value: "COD", label: "COD (Thanh toán khi nhận hàng)" },
    { value: "ZALO_PAY", label: "ZaloPay" },
  ];

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

  const totalAmount = useMemo(() => {
    return selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.price,
      0
    );
  }, [selectedProducts]);

  const totalDiscountAmount = useMemo(() => {
    return selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.finalPrice,
      0
    );
  }, [selectedProducts]);

  const { mutate: createMutate, isPending: creating } = useCreateOrder(
    (order) => router.push(`/orders/${order.uuid}`)
  );

  const handleSave = useCallback(() => {

    if (!orderPriceInfo) {
      getToastApi().error("Chưa cập nhật tiền giảm giá");
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
      paymentMethod,
      totalAmount: orderPriceInfo.totalAmount,
      totalSaved: orderPriceInfo.totalSaved,
      discountIds: orderPriceInfo.orderDiscountIds,
      items: productsToSave,
    };


    createMutate(payload);
  }, [supplierUUID, selectedProducts, note, paymentMethod, orderPriceInfo]);

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
              disabled={quantity <= 1}
              onClick={() => handleQuantityChange2(record.uuid, quantity - 1)}
            />
            <InputCurrency
              size="small"
              showCurrencySymbol={false}
              min={1}
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
      { title: "Đơn hàng", href: "/orders" },
      { title: "Tạo đơn hàng" },
    ];
  }, []);

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

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />

        <Row gutter={[40, 10]}>
          <Col xl={{ span: 16 }}>
            <Flex vertical gap={5}>
              <Table
                rowKey="uuid"
                columns={columns}
                dataSource={selectedProducts}
                pagination={false}
                style={{ marginTop: 10 }}
                scroll={{ x: 500 }}
              />
              <Flex>
                <BTNAdd onClick={() => setOpenFormSelectProduct(true)}>
                  Thêm sản phẩm
                </BTNAdd>
              </Flex>
            </Flex>
          </Col>
          <Col xl={{ span: 8 }}>
            <Flex vertical gap={30}>
              <Flex vertical gap={5}>
                <Title level={5}>Phương thức thanh toán</Title>
                <Radio.Group
                  value={paymentMethod}
                  onChange={(e: RadioChangeEvent) => {
                    const { value } = e.target;
                    setPaymentMethod(value);
                  }}
                  options={paymentMethodOptions}
                  style={{ width: "100%" }}
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
              <Flex justify="space-between" align="flex-start" className="py-2">
                <OrderTotalAmountDisplay onDiscountDataChange={handleDiscountDataChange} orderTotalAmount={totalAmount} orderTotalAmountAfterDiscountProducts={totalDiscountAmount} />
              </Flex>
            </Flex>
          </Col>
        </Row>

        <Flex justify="end">
          <Button type="primary" onClick={handleSave} loading={creating}>
            Tiếp
          </Button>
        </Flex>
      </Flex>
      <FMProductSelection
        onlyActiveProduct={true}
        open={openFormSelectProduct}
        onCancle={() => setOpenFormSelectProduct(false)}
        onSelected={handleProductSelected}
      />
    </>
  );
};

export default OrderPage;

//#endregion
