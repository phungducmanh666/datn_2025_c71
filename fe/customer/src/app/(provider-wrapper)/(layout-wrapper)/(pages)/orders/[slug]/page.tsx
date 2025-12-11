"use client";

import BTNDetail from "@component/btnDetail";
import FMReviewCreate from "@component/fmReviewCreate";
import ImageSever from "@component/imageServer";
import OrderItemPriceInfo from "@component/infoOrderItemPrice";
import OrderItemPriceInfo2 from "@component/infoOrderItemPrice2";
import OrderTotalAmountDisplay2 from "@component/orderTotalAmountDisplay2";
import {
  OrderData,
  OrderLineData,
  OrderPaymentMethod,
  OrderStatus,
} from "@data/orderData";
import {
  OrderProduct,
  useOrder,
  useOrderProducts,
  useComfirmOrder as useUpdateOrderStatus,
} from "@hook/orderHook/orderHook";
import { useCreatePaymentOrder } from "@hook/orderHook/paymentHook";
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
  Tag,
  theme,
} from "antd";
import Breadcrumb, { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

//#region order lines

interface OrderLineProps {
  items: OrderLineData[];
  status: string;
  refetch?: () => any;
  orderData: OrderData
}

const OrderLine: React.FC<OrderLineProps> = ({ status, items, refetch,orderData }) => {
  const [selectedOrderLineUUID, setSelectedOrderLineUUID] = useState<string>();
  const [openFormRating, setOpenFormRating] = useState<boolean>(false);
  const { data: products, isFetching: loading } = useOrderProducts(items);

  const router = useRouter();

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
        key: "number",
        render: (number: number) => ConvertUtil.formatVNNumber(number),
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
      {
        title: "Thao tác",
        key: "review",
        render: (r: OrderProduct) => {
            let action = <></>

          if (status === OrderStatus.SUCCESS) {
            if (r.review === null) {
              action = <Tag
                  color="blue-inverse"
                  onClick={() => {
                    setSelectedOrderLineUUID(r.orderLineUUID);
                    setOpenFormRating(true);
                  }}
                >
                  Đánh giá
                </Tag>
            }
            else
            action= <Tag color="orange-inverse">Đã đánh giá</Tag>;
          }
          return <Flex gap={10}>
            {action}
            <BTNDetail onClick={() => router.push(`/products/${r.productUUID}`)}/>
          </Flex>
        },
      },
    ],
    [products]
  );

  // const totalAmount = useMemo(() => {
  //   if (!products || products.length === 0) return 0;
  //   return products.reduce((sum: number, product: OrderProduct) => {
  //     return sum + product.number * product.unitPrice;
  //   }, 0);
  // }, [products]);

  return (
    <Flex vertical gap={20}>
      <Table
        size="small"
        dataSource={products}
        columns={productColumns}
        loading={loading}
        rowKey="uuid"
        pagination={false}
      />
            {orderData && <Card><OrderTotalAmountDisplay2 orderData={orderData} /></Card>}

      {selectedOrderLineUUID && (
        <FMReviewCreate
          open={openFormRating}
          orderLineUUID={selectedOrderLineUUID}
          onCreated={() => {
            setOpenFormRating(false);
            refetch?.();
          }}
          onCancle={() => {
            setOpenFormRating(false);
            refetch?.();
          }}
        />
      )}
    </Flex>
  );
};

//#endregion

interface PageOrderDetailProps {}

const PageOrderDetail: React.FC<PageOrderDetailProps> = ({}) => {
  const { slug: uuid } = useParams<{ slug: string }>();
  const { data, isFetching, refetch } = useOrder(uuid);

  console.log(data);

  const desItems = useMemo(
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
              key: 5,
              label: "Ngày tạo",
              children: ConvertUtil.convertVietNamDateTime(data.createdAt),
            },

            {
              key: 4,
              label: "Trạng thái",
              children: ConvertUtil.getOrderStatusLabel(data.status),
            },
            {
              key: 12,
              label: "Thanh toán",
              children: ConvertUtil.getOrderThanhToanLabel(data),
            },
            {
              key: 11,
              label: "Ghi chú",
              children: data.note,
            },
          ]
        : [],
    [data]
  );

  const desItems2 = useMemo(
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
    useUpdateOrderStatus(() => refetch());

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(() => {
    return data
      ? [
          { title: "Trang chủ", href: "/home" },
          { title: "Đơn hàng", href: "/orders" },
          { title: ConvertUtil.formatUUID(uuid) },
        ]
      : [];
  }, [data]);

  const { token } = theme.useToken();

  console.log(data);

  return (
    <>
      <Flex vertical gap={40}>
        <Breadcrumb items={breadCrumbItems} />
        <Row gutter={[10, 30]}>
          <Col md={{ span: 24 }} xl={{ span: 16 }}>
            {data?.items && (
              <OrderLine
              orderData={data}
                refetch={refetch}
                status={data.status}
                items={data.items}
              />
            )}
          </Col>
          <Col md={{ span: 24 }} xl={{ span: 8 }}>
            <Flex vertical gap={20}>
              <Card title="Thông tin đơn hàng">
                <Descriptions
                  styles={{
                    label: {
                      fontWeight: "bold",
                      color: token.colorText,
                      width: 200,
                      maxWidth: "50%",
                    },
                    content: { paddingLeft: 8 },
                  }}
                  size="small"
                  bordered={false}
                  layout="horizontal"
                  column={1}
                  items={desItems}
                />
              </Card>
              {data?.deliveryInfomation && (
                <Card title="Thông tin giao hàng">
                  <Descriptions
                    styles={{
                      label: {
                        fontWeight: "bold",
                        color: token.colorText,
                        width: 200,
                        maxWidth: "50%",
                      },
                      content: { paddingLeft: 8 },
                    }}
                    size="small"
                    bordered={false}
                    layout="horizontal"
                    column={1}
                    items={desItems2}
                  />
                </Card>
              )}
            </Flex>
          </Col>
        </Row>

        <Flex gap={10} justify="end">
          {data &&
            data.status !== OrderStatus.CANCLED &&
            data.status !== OrderStatus.RETURNING &&
            data.status !== OrderStatus.RETURNED &&
            data.paymentMethod === OrderPaymentMethod.ZALO_PAY &&
            data.payment.paymentAmount == null && (
              <Button
                size="small"
                type="primary"
                onClick={() => createPaymentOrder(uuid)}
              >
                Thanh toán ngay
              </Button>
            )}

          {data && ConvertUtil.isOrderCanCancle(data.status) && (
            <Popconfirm
              title="Hủy đơn hàng"
              onConfirm={() =>
                updateStatusMutate({
                  uuid,
                  status: "cancle",
                })
              }
            >
              <Button size="small" variant="solid" color="danger">
                Hủy đơn hàng
              </Button>
            </Popconfirm>
          )}
        </Flex>
      </Flex>
    </>
  );
};

export default PageOrderDetail;
