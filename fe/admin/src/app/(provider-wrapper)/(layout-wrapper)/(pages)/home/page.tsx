"use client";

import BTNStatistics from "@component/btnStatistics";
import StatisticsCustomerCount from "@component/statisticsCustomerCount";
import StatisticsOrderCount from "@component/statisticsOrderCount";
import StatisticsOrderPending from "@component/statisticsOrderPending";
import StatisticsOrderStatus from "@component/statisticsOrderStatus";
import StatisticsProductCount from "@component/statisticsProductCount";
import StatisticsProductStatus from "@component/statisticsProductStatus";
import StatisticsStaffCount from "@component/statisticsStaffCount";
import { Card, Col, Flex, Row } from "antd";
import React from "react";

//#region mockdata
const productStatistics = [
  { status: "DRAFT", number: 10 },
  { status: "ACTIVE", number: 98 },
  { status: "INACTIVE", number: 6 },
  { status: "HIDE", number: 3 },
];
//#endregion

//#region counter

interface StatisticCounterProps {}

const StatisticCounter: React.FC<StatisticCounterProps> = ({}) => {
  return (
    <Row gutter={[10, 10]}>
      <Col xs={{ span: 24 }} sm={{ span: 12 }} xl={{ span: 6 }}>
        <Card style={{ width: "100%" }}>
          <StatisticsProductCount />
        </Card>
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 12 }} xl={{ span: 6 }}>
        <Card style={{ width: "100%" }}>
          <StatisticsCustomerCount />
        </Card>
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 12 }} xl={{ span: 6 }}>
        <Card style={{ width: "100%" }}>
          <StatisticsStaffCount />
        </Card>
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 12 }} xl={{ span: 6 }}>
        <Card style={{ width: "100%" }}>
          <StatisticsOrderCount />
        </Card>
      </Col>
    </Row>
  );
};
//#endregion

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = ({}) => {
  return (
    <Flex vertical gap={40}>
      <Flex>
        <BTNStatistics>Xem thống kê đơn hàng</BTNStatistics>
      </Flex>
      <StatisticCounter />
      <Row gutter={[10, 10]}>
        <Col sm={{ span: 24 }} xl={{ span: 14 }}>
          <Flex vertical gap={50}>
            <StatisticsOrderStatus />
            <StatisticsProductStatus />
          </Flex>
        </Col>
        <Col sm={{ span: 24 }} xl={{ span: 10 }}>
          <StatisticsOrderPending />
        </Col>
      </Row>
    </Flex>
  );
};

export default HomePage;
