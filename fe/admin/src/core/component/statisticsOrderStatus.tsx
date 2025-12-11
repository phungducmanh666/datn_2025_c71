"use client";

import { StatusStatisticsData } from "@data/productData"; // Giả định interface này đã có
import { useOrderStatusStatistics } from "@hook/orderHook/orderHook"; // Giả định hook này đã có
import { Card, Col, Flex, Row, Skeleton, Typography } from "antd";
import React, { useMemo } from "react";
// --- IMPORT MỚI: Biểu đồ Cột ---
import { Column } from "@ant-design/charts";

const { Text, Title } = Typography;

// --- Định nghĩa Map Trạng Thái, Màu Sắc và THỨ TỰ (GIỮ NGUYÊN) ---
const STATUS_MAP: {
  [key: string]: {
    vietnameseName: string;
    color: string;
    order: number;
  };
} = {
  // 1. SUCCESS
  SUCCESS: { vietnameseName: "Thành công", color: "#389e0d", order: 1 },
  // 2. PENDING
  PENDING: { vietnameseName: "Đang chờ xử lý", color: "#faad14", order: 2 },
  // 3. PROCESSING
  PROCESSING: { vietnameseName: "Đang xử lý", color: "#1890ff", order: 3 },
  // 4. SHIPPING
  SHIPPING: { vietnameseName: "Đang giao hàng", color: "#52c41a", order: 4 },
  // 5. RETURNING
  RETURNING: { vietnameseName: "Đang hoàn trả", color: "#eb2f96", order: 5 },
  // 6. RETURNED
  RETURNED: { vietnameseName: "Đã hoàn trả", color: "#f5222d", order: 6 },
  // 7. CANCLED
  CANCLED: { vietnameseName: "Đã hủy", color: "#8c8c8c", order: 7 },
};

const ALL_STATUS_KEYS = Object.keys(STATUS_MAP);

interface FormattedStatusData {
  status: string;
  vietnameseName: string;
  color: string;
  number: number;
  percent: number;
  order: number;
}

interface StatisticsOrderStatusProps {}

const StatisticsOrderStatus: React.FC<StatisticsOrderStatusProps> = () => {
  const { data: statusData, isFetching } = useOrderStatusStatistics();

  const { totalOrders, chartData, colors } = useMemo(() => {
    // 1. Logic xử lý dữ liệu (Giữ nguyên)
    const initialStatistics: { [key: string]: FormattedStatusData } = {};
    ALL_STATUS_KEYS.forEach((statusKey) => {
      const mapping = STATUS_MAP[statusKey];
      initialStatistics[statusKey] = {
        status: statusKey,
        vietnameseName: mapping.vietnameseName,
        color: mapping.color,
        order: mapping.order,
        number: 0,
        percent: 0,
      } as FormattedStatusData;
    });

    if (statusData && statusData.length > 0) {
      statusData.forEach((item: StatusStatisticsData) => {
        if (initialStatistics[item.status]) {
          initialStatistics[item.status].number = item.number;
        }
      });
    }

    const statisticsArray = Object.values(initialStatistics);
    const total = statisticsArray.reduce((sum, item) => sum + item.number, 0);

    const finalStatistics = statisticsArray
      .map((item) => {
        const percent = total > 0 ? (item.number / total) * 100 : 0;
        return {
          ...item,
          percent: parseFloat(percent.toFixed(1)),
          // Đổi tên trường cho Column Chart: Tên trạng thái (x) và Giá trị (y)
          statusName: item.vietnameseName,
          count: item.number,
        };
      })
      .sort((a, b) => a.order - b.order);
    // KHÔNG lọc bỏ số lượng 0, để biểu đồ cột hiển thị đầy đủ các trạng thái
    // .filter(item => item.number > 0);

    const chartColors = finalStatistics.map((item) => item.color);

    return {
      totalOrders: total,
      chartData: finalStatistics,
      colors: chartColors,
    };
  }, [statusData]);

  // --- Cấu hình Biểu đồ Cột (Column Chart Config) ---
  const columnConfig = {
    data: chartData,
    xField: "statusName", // Trục X: Tên trạng thái
    yField: "count", // Trục Y: Số lượng đơn hàng
    seriesField: "statusName", // Dùng cho màu sắc
    color: colors,
    // Tùy chỉnh màu cột để mỗi cột có màu riêng biệt (theo màu đã định nghĩa)
    columnStyle: (data: (typeof chartData)[0]) => {
      return {
        fill: data.color,
      };
    },
    label: {
      // Hiển thị số lượng ngay trên đỉnh cột
      content: (item: (typeof chartData)[0]) => item.count.toString(),
      position: "top",
      style: {
        fill: "#000000",
        fontSize: 12,
      },
    },
    tooltip: {
      formatter: (data: (typeof chartData)[0]) => {
        return {
          name: data.statusName,
          value: `${data.count} đơn hàng (${data.percent}%)`,
        };
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
        autoHide: false,
        // Cắt tên trạng thái nếu quá dài
        formatter: (val: string) => {
          return val.length > 15 ? val.substring(0, 15) + "..." : val;
        },
      },
    },
    yAxis: {
      title: {
        text: "Số lượng đơn hàng",
      },
    },
    // Chiều cao cố định
    height: 350,
  };

  // --- Logic Hiển thị ---
  if (isFetching) {
    return (
      <Card title="Thống kê Trạng thái Đơn hàng">
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  const isTotalZero = totalOrders === 0;

  return (
    <Card
      title="Thống kê Trạng thái Đơn hàng"
      extra={
        <Title level={5} style={{ marginBottom: 0 }}>
          Tổng: {totalOrders}
        </Title>
      }
    >
      {isTotalZero ? (
        <Text type="secondary">Chưa có đơn hàng nào được tạo.</Text>
      ) : (
        <Row gutter={[24, 24]} align="top">
          {/* Cột 1: Biểu đồ Cột */}
          <Col span={24}>
            <Column {...columnConfig} />
          </Col>

          {/* Bạn có thể giữ lại Legend chi tiết bên dưới nếu cần */}
          <Col span={24}>
            <Title level={5}>Chi tiết:</Title>
            <Row gutter={[16, 8]}>
              {chartData.map((item) => (
                <Col xs={12} sm={8} lg={6} key={item.status} className="py-1">
                  <Flex vertical gap={10}>
                    <Text strong style={{ color: item.color }}>
                      {item.statusName}:
                    </Text>
                    <Text>
                      <Text strong>{item.count}</Text> ({item.percent}%)
                    </Text>
                  </Flex>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default StatisticsOrderStatus;
