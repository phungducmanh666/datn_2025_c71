"use client";

import { Line } from "@ant-design/charts";
import {
  CheckCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useOrderStatistics } from "@hook/orderHook/orderHook";
import { ConvertUtil } from "@util/convertUtil";
import {
  Breadcrumb,
  Card,
  Col,
  DatePicker,
  Flex,
  Row,
  Spin,
  Statistic,
} from "antd";
import { BreadcrumbItemType } from "antd/es/breadcrumb/Breadcrumb";
import dayjs, { Dayjs } from "dayjs";
import React, { useMemo, useState } from "react";

const { RangePicker } = DatePicker;

const DEFAULT_END_DATE = dayjs();
const DEFAULT_START_DATE = dayjs().subtract(30, "day");

interface PageOrderStatisticsProps {}

const PageOrderStatistics: React.FC<PageOrderStatisticsProps> = () => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([
    DEFAULT_START_DATE,
    DEFAULT_END_DATE,
  ]);

  const startDate = dateRange?.[0]?.toDate() ?? DEFAULT_START_DATE.toDate();
  const endDate = dateRange?.[1]?.toDate() ?? DEFAULT_END_DATE.toDate();

  const { data: statisticsData, isFetching } = useOrderStatistics({
    startDate,
    endDate,
  });

  const processedData = useMemo(() => {
    if (!statisticsData?.length) {
      return {
        revenueChartData: [],
        orderChartData: [],
        totalOrders: 0,
        totalEstimatedAmount: 0,
        totalSuccessAmount: 0,
      };
    }

    const revenueData: Array<{
      date: string;
      value: number;
      category: string;
    }> = [];
    const orderData: Array<{ date: string; value: number }> = [];

    let totalOrdersSum = 0;
    let totalEstimatedSum = 0;
    let totalSuccessSum = 0;

    statisticsData.forEach((item) => {
      revenueData.push(
        {
          date: item.date,
          value: item.totalAmount,
          category: "Giá trị ước tính",
        },
        {
          date: item.date,
          value: item.totalSuccessAmount,
          category: "Giá trị thực tế",
        }
      );

      orderData.push({
        date: item.date,
        value: item.totalOrders,
      });

      totalOrdersSum += item.totalOrders;
      totalEstimatedSum += item.totalAmount;
      totalSuccessSum += item.totalSuccessAmount;
    });

    return {
      revenueChartData: revenueData,
      orderChartData: orderData,
      totalOrders: totalOrdersSum,
      totalEstimatedAmount: totalEstimatedSum,
      totalSuccessAmount: totalSuccessSum,
    };
  }, [statisticsData]);

  const revenueChartConfig = useMemo(
    () => ({
      data: processedData.revenueChartData,
      xField: "date",
      yField: "value",
      seriesField: "category",
      smooth: true,
      height: 350,
      color: ["#52c41a", "#1890ff"],
      autoFit: true,
      xAxis: {
        type: "timeCat" as const,
        label: {
          autoRotate: false,
        },
      },
      yAxis: {
        label: {
          formatter: (val: string) => {
            const num = parseFloat(val);
            if (num >= 1000000) {
              return `${(num / 1000000).toFixed(1)}M`;
            }
            if (num >= 1000) {
              return `${(num / 1000).toFixed(0)}K`;
            }
            return num.toString();
          },
        },
      },
      tooltip: {},
      legend: {
        position: "top" as const,
      },
      point: {
        size: 3,
        shape: "circle",
      },
    }),
    [processedData.revenueChartData]
  );

  const orderChartConfig = useMemo(
    () => ({
      data: processedData.orderChartData,
      xField: "date",
      yField: "value",
      smooth: true,
      height: 350,
      color: "#faad14",
      autoFit: true,
      xAxis: {
        type: "timeCat" as const,
        label: {
          autoRotate: false,
        },
      },
      yAxis: {
        label: {
          formatter: (val: string) => Math.round(parseFloat(val)).toString(),
        },
      },
      tooltip: {},
      point: {
        size: 3,
        shape: "circle",
      },
      areaStyle: {
        fillOpacity: 0.1,
      },
    }),
    [processedData.orderChartData]
  );

  const formatCurrency = (value: number | string) =>
    ConvertUtil.formatVNCurrency(value);

  const breadCrumbItems = useMemo<Partial<BreadcrumbItemType>[]>(
    () => [
      { title: "Trang chủ", href: "/home" },
      { title: "Thống kê đơn hàng" },
    ],
    []
  );

  return (
    <Flex vertical gap={50}>
      <Breadcrumb items={breadCrumbItems} />
      <Flex vertical gap={24}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
            📊 Thống Kê Đơn Hàng
          </h2>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
            format="DD/MM/YYYY"
            disabledDate={(current) =>
              current && current > dayjs().endOf("day")
            }
            size="large"
          />
        </Flex>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="Tổng Số Đơn Hàng"
                value={processedData.totalOrders}
                loading={isFetching}
                prefix={<ShoppingOutlined style={{ color: "#faad14" }} />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="Tổng Giá Trị Ước Tính"
                value={processedData.totalEstimatedAmount}
                loading={isFetching}
                prefix={<DollarOutlined style={{ color: "#1890ff" }} />}
                formatter={formatCurrency}
                valueStyle={{ color: "#1890ff", fontSize: "20px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card hoverable>
              <Statistic
                title="Tổng Giá Trị Thực Tế"
                value={processedData.totalSuccessAmount}
                loading={isFetching}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                formatter={formatCurrency}
                valueStyle={{ color: "#52c41a", fontSize: "20px" }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="💰 Biểu Đồ Giá Trị Đơn Hàng">
          {isFetching && !statisticsData ? (
            <Flex justify="center" align="center" style={{ height: 350 }}>
              <Spin size="large" tip="Đang tải dữ liệu..." />
            </Flex>
          ) : processedData.revenueChartData.length === 0 ? (
            <Flex justify="center" align="center" style={{ height: 350 }}>
              <p style={{ color: "#8c8c8c" }}>
                Không có dữ liệu trong khoảng thời gian đã chọn
              </p>
            </Flex>
          ) : (
            <Line
              {...revenueChartConfig}
              key={`revenue-${processedData.revenueChartData.length}-${isFetching}`}
            />
          )}
        </Card>

        <Card title="📦 Biểu Đồ Số Lượng Đơn Hàng">
          {isFetching && !statisticsData ? (
            <Flex justify="center" align="center" style={{ height: 350 }}>
              <Spin size="large" tip="Đang tải dữ liệu..." />
            </Flex>
          ) : processedData.orderChartData.length === 0 ? (
            <Flex justify="center" align="center" style={{ height: 350 }}>
              <p style={{ color: "#8c8c8c" }}>
                Không có dữ liệu trong khoảng thời gian đã chọn
              </p>
            </Flex>
          ) : (
            <Line
              {...orderChartConfig}
              key={`order-${processedData.orderChartData.length}-${isFetching}`}
            />
          )}
        </Card>
      </Flex>
    </Flex>
  );
};

export default PageOrderStatistics;
