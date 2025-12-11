"use client";

import { OrderData, OrderStatus } from "@data/orderData";
import { useOrders } from "@hook/orderHook/orderHook";
import { ConvertUtil } from "@util/convertUtil";
import { Card, Flex, Skeleton, Space, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import BTNDetail from "./btnDetail";
import CustomerInfo from "./customerInfo";

//#region order item

interface OrderItemProps {
  data: OrderData;
}

const OrderItem: React.FC<OrderItemProps> = ({ data }) => {
  const router = useRouter();

  return (
    <Card size="small">
      <Flex justify="space-between" gap={10}>
        <Flex vertical gap={10}>
          <Flex gap={10}>
            <Typography.Text strong>Khách hàng</Typography.Text>
            <CustomerInfo uuid={data.customerUUID} />
          </Flex>
          <div style={{ fontSize: "0.7rem" }}>
            <Flex gap={10}>
              <strong>Tổng tiền</strong>
              {ConvertUtil.formatVNCurrency(data.totalAmount)}
            </Flex>
            <Flex gap={10}>
              <strong>Thời gian</strong>
              {ConvertUtil.convertVietNamDate(data.createdAt)}
            </Flex>
          </div>
        </Flex>
        <BTNDetail onClick={() => router.push(`orders/${data.uuid}`)} />
      </Flex>
    </Card>
  );
};

//#endregion

interface StatisticsOrderPendingProps {}

const StatisticsOrderPending: React.FC<StatisticsOrderPendingProps> = ({}) => {
  const { data: page, isFetching } = useOrders(OrderStatus.PENDING, undefined, {
    page: 0,
    size: 5,
    sort: "createdAt,DESC",
  });

  const items = useMemo(() => {
    if (!page || !page.items) return [];
    return page.items;
  }, [page]);

  console.log(items);

  if (isFetching) {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Space>
    );
  }

  return (
    <Card title={`Đơn hàng đang chờ`} size="small">
      <Flex vertical gap={10}>
        {items.map((item) => (
          <OrderItem key={item.uuid} data={item} />
        ))}
      </Flex>
    </Card>
  );
};

export default StatisticsOrderPending;
