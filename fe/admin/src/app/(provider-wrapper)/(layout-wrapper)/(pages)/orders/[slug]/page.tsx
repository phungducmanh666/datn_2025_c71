"use client";

import BTNComfirmOrder from "@component/btnComfirmOrder";
import BTNShippingOrder from "@component/btnShippingOrder";
import ImageSever from "@component/imageServer";
import OrderItemPriceInfo from "@component/infoOrderItemPrice";
import OrderItemPriceInfo2 from "@component/infoOrderItemPrice2";
import OrderTotalAmountDisplay2 from "@component/orderTotalAmountDisplay2";
import ProductOrderNumber from "@component/productOrderNumber";
import {
  OrderData,
  OrderLineData,
  OrderPaymentMethod,
  OrderStatus,
} from "@data/orderData";
import {
  OrderProduct,
  useComfirmOrder,
  useOrder,
  useOrderProducts
} from "@hook/orderHook/orderHook";
import {
  useCreatePaymentOrder,
  useRefundOrder,
} from "@hook/orderHook/paymentHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Button,
  Card,
  Col,
  Descriptions,
  DescriptionsProps,
  Flex,
  Popconfirm,
  Row,
  Table,
  theme
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useParams } from "next/navigation";
import { useMemo } from "react";

//#region order lines

interface OrderLineProps {
  items: OrderLineData[];
  orderData: OrderData;
}

const OrderLine: React.FC<OrderLineProps> = ({ items, orderData }) => {
  const { data: products, isFetching: loading } = useOrderProducts(items);

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
        title: "Số lượng",
        dataIndex: "number",
        render: (number: number, r: OrderProduct) => {
          if (orderData.status === OrderStatus.PENDING) {
            return <ProductOrderNumber data={r} />
          }
          return ConvertUtil.formatVNNumber(number);
        },
      },
      {
        title: "Đơn giá",
        key: "unitPrice",
        render: (_: any, r: OrderProduct) => {
          return <OrderItemPriceInfo product={r} />
        },
      },
      {
        title: "Thành tiền",
        key: "unitPrice",
        render: (_: any, r: OrderProduct) => {
          return <OrderItemPriceInfo2 product={r} />
        },
      },
    ],
    []
  );

  return (
    <Flex vertical gap={40}>
      <Table
        size="small"
        dataSource={products}
        columns={productColumns}
        loading={loading}
        rowKey="uuid"
        pagination={false}
      // Thêm thuộc tính summary để tính tổng tiền
      />

    </Flex>
  );
};

//#endregion

interface PageOrderDetailProps {
}

const PageOrderDetail: React.FC<PageOrderDetailProps> = ({ }) => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useOrder(uuid);

  const desThongTinDonHang = useMemo(
    (): DescriptionsProps["items"] =>
      data
        ? [
          {
            key: 1,
            label: "Mã đơn hàng",
            children: ConvertUtil.formatUUID(data.uuid),
          },
          {
            key: 3,
            label: "Phương thức thanh toán",
            children: ConvertUtil.getOrderPaymentMethodComponent(
              data.paymentMethod
            ),
          },
          {
            key: 12,
            label: "Trạng thái thanh toán",
            children: ConvertUtil.getOrderThanhToanLabel(data),
          },
          {
            key: 4,
            label: "Trạng thái",
            children: ConvertUtil.getOrderStatusLabel(data.status),
          },
          {
            key: 5,
            label: "Ngày tạo",
            children: ConvertUtil.convertVietNamDate(data.createdAt),
          },

          {
            key: 2,
            label: "Ghi chú",
            children: data.note,
          },
        ]
        : [],
    [data]
  );

  const desItem2 = useMemo(
    (): DescriptionsProps["items"] =>
      data?.deliveryInfomation
        ? [
          {
            key: 1,
            label: "Tên người nhận",
            children: data.deliveryInfomation.recipientName,
          },
          {
            key: 2,
            label: "Số điện thoại",
            children: data.deliveryInfomation.recipientPhoneNumber,
          },
          {
            key: 3,
            label: "Địa chỉ",
            children: data.deliveryInfomation.deliveryAddress,
          },
        ]
        : [],
    [data]
  );

  const { mutate: createPaymentOrder, isPending: createPaymentLoading } =
    useCreatePaymentOrder(() => refetch());

  const { mutate: updateStatusMutate, isPending: isComfirming } =
    useComfirmOrder(() => refetch());

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
        { title: "Trang chủ", href: "/home" },
        { title: "Đơn hàng", href: "/orders" },
        { title: "Thông tin đơn hàng" },
      ]
      : [];
  }, [data]);

  const { token } = theme.useToken();

  const { mutate: refundMutate, isPending: refunning } =
    useRefundOrder(refetch);

  const ActionComponents = useMemo(() => {
    if (!data) return [];
    const components = [];
    if (data.status === OrderStatus.PENDING) {
      components.push(
        <BTNComfirmOrder key={1} uuid={uuid} items={data.items} />
      );
    }
    if (data.status === OrderStatus.PROCESSING) {
      components.push(
        <BTNShippingOrder key={1} uuid={uuid} items={data.items} />
      );
    }

    if (
      data.status === OrderStatus.PENDING ||
      data.status === OrderStatus.PROCESSING
    ) {
      components.push(
        <Button
          key={2}
          size="small"
          variant="solid"
          color="danger"
          onClick={() => updateStatusMutate({ uuid, status: "cancle" })}
        >
          Hủy đơn
        </Button>
      );
    }
    if (data.status === OrderStatus.SHIPPING) {
      // giao hang thanh cong
      if (data?.payment?.paymentAmount) {
        components.push(
          <Button
            key={5}
            size="small"
            type="primary"
            onClick={() => updateStatusMutate({ uuid, status: "success" })}
          >
            Giao hàng thành công
          </Button>
        );
      }

      // xac nhan da nhan tien
      if (
        data.paymentMethod === OrderPaymentMethod.COD &&
        !!!data?.payment?.paymentAmount
      ) {
        components.push(
          <Popconfirm
            key={6}
            title="Xác nhận đã thu tiền"
            onConfirm={() =>
              updateStatusMutate({ uuid, status: "da-thu-tien" })
            }
          >
            <Button size="small" type="primary" loading={refunning}>
              Đã thu tiền
            </Button>
          </Popconfirm>
        );
      }

      if (
        !(
          data.paymentMethod === OrderPaymentMethod.COD &&
          data.payment?.paymentAmount
        )
      ) {
        components.push(
          <Button
            key={3}
            size="small"
            variant="solid"
            color="danger"
            onClick={() => updateStatusMutate({ uuid, status: "return" })}
          >
            Hoàn trả hàng
          </Button>
        );
      }
    }

    if (data.status === OrderStatus.RETURNING) {
      components.push(
        <Button
          key={1}
          size="small"
          type="primary"
          onClick={() => updateStatusMutate({ uuid, status: "returned" })}
        >
          Kho đã tiếp nhận hàng
        </Button>
      );
    }

    if (
      data.status === OrderStatus.CANCLED ||
      data.status === OrderStatus.RETURNED
    ) {
      if (
        data.paymentMethod === OrderPaymentMethod.ZALO_PAY &&
        !!data?.payment?.paymentAmount &&
        !!!data.refund
      ) {
        components.push(
          <Popconfirm
            key={6}
            title="Hoàn tiền"
            onConfirm={() => refundMutate(uuid)}
          >
            <Button size="small" type="primary" loading={refunning}>
              Hoàn tiền
            </Button>
          </Popconfirm>
        );
      }
    }
    if (
      data.status === OrderStatus.PENDING ||
      data.status === OrderStatus.PROCESSING ||
      data.status === OrderStatus.SHIPPING
    ) {
      if (
        data.paymentMethod === OrderPaymentMethod.ZALO_PAY &&
        !!!data?.payment?.paymentAmount
      ) {
        components.push(
          <Button
            key={7}
            size="small"
            type="primary"
            onClick={() => createPaymentOrder(uuid)}
          >
            Lấy mã thanh toán
          </Button>
        );
      }
    }

    return components;
  }, [data]);

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Row gutter={[40, 10]}>
          <Col md={{ span: 24 }} xl={{ span: 16 }}>
            {data?.items && <OrderLine orderData={data} items={data.items} />}
          </Col>
          <Col md={{ span: 24 }} xl={{ span: 8 }}>
            <Flex vertical gap={10}>
              <Card title="Thông tin đơn hàng">
                <Descriptions
                  styles={{
                    label: {
                      fontWeight: "bold",
                      color: token.colorText,
                      maxWidth: "50%",
                    },
                    content: { paddingLeft: 8 },
                  }}
                  size="small"
                  bordered={false}
                  layout="horizontal"
                  column={1}
                  items={desThongTinDonHang}
                />
              </Card>
              {data?.deliveryInfomation && (
                <Card title="Thông tin giao hàng">
                  <Descriptions
                    styles={{
                      label: {
                        fontWeight: "bold",
                        color: token.colorText,
                        maxWidth: "50%",
                      },
                      content: { paddingLeft: 8 },
                    }}
                    size="small"
                    bordered={false}
                    layout="horizontal"
                    column={1}
                    items={desItem2}
                  />
                </Card>
              )}

              {data && <Card><OrderTotalAmountDisplay2 orderData={data} /></Card>}
            </Flex>

          </Col>
        </Row>

        <Flex gap={10}>{ActionComponents.map((comp) => comp)}</Flex>
      </Flex>
    </>
  );
};

export default PageOrderDetail;
