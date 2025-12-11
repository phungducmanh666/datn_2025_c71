import { StatusStatisticsData } from "@data/productData";
import { useProductStatusStatistics } from "@hook/productHook/productHook";
import { Card, Col, Progress, Row, Skeleton, Space, Typography } from "antd";
import Title from "antd/es/typography/Title";
import React, { useMemo } from "react";

const { Text } = Typography;

// --- Định nghĩa Map Trạng Thái, Màu Sắc và THỨ TỰ (CẬP NHẬT) ---
const STATUS_MAP: {
  [key: string]: {
    vietnameseName: string;
    color: string;
    order: number; // Thêm trường order để định nghĩa thứ tự hiển thị
  };
} = {
  // 1. SUCCESS
  ACTIVE: { vietnameseName: "Đang kinh doanh", color: "#0784f2ff", order: 1 },
  // 2. PENDING
  INACTIVE: {
    vietnameseName: "Ngừng kinh doanh",
    color: "#ff8800ff",
    order: 2,
  },
  // 3. PROCESSING
  DRAFT: { vietnameseName: "Nháp", color: "#4f4f4fff", order: 3 },
  HIDE: { vietnameseName: "Ẩn", color: "#ff0000ff", order: 4 },
  // 4. SHIPPING
};

// --- Danh sách tất cả các STATUS ---
const ALL_STATUS_KEYS = Object.keys(STATUS_MAP);

interface FormattedStatusData {
  status: string;
  vietnameseName: string;
  color: string;
  number: number;
  percent: number;
  order: number; // Thêm order vào interface để sử dụng khi sắp xếp
}

interface StatisticsProductStatusProps {}

const StatisticsProductStatus: React.FC<
  StatisticsProductStatusProps
> = ({}) => {
  const { data: statusData, isFetching } = useProductStatusStatistics();

  const { totalProducts, statistics } = useMemo(() => {
    // 1. Tạo cấu trúc dữ liệu ban đầu với tất cả 7 trạng thái
    const initialStatistics: { [key: string]: FormattedStatusData } = {};
    ALL_STATUS_KEYS.forEach((statusKey) => {
      const mapping = STATUS_MAP[statusKey];
      initialStatistics[statusKey] = {
        status: statusKey,
        vietnameseName: mapping.vietnameseName,
        color: mapping.color,
        order: mapping.order, // Gán thứ tự hiển thị
        number: 0,
        percent: 0,
      } as FormattedStatusData;
    });

    // 2. Cập nhật số lượng từ dữ liệu trả về của API
    if (statusData && statusData.length > 0) {
      statusData.forEach((item: StatusStatisticsData) => {
        if (initialStatistics[item.status]) {
          initialStatistics[item.status].number = item.number;
        }
      });
    }

    // 3. Chuyển đổi thành mảng, tính toán tổng số đơn hàng và phần trăm
    const statisticsArray = Object.values(initialStatistics);
    const total = statisticsArray.reduce((sum, item) => sum + item.number, 0);

    const finalStatistics = statisticsArray
      .map((item) => {
        const percent = total > 0 ? (item.number / total) * 100 : 0;
        return {
          ...item,
          percent: percent,
        };
      })
      // THAY ĐỔI QUAN TRỌNG: Sắp xếp theo trường 'order'
      .sort((a, b) => a.order - b.order);

    return { totalProducts: total, statistics: finalStatistics };
  }, [statusData]);

  // --- Logic Hiển thị ---
  if (isFetching) {
    return (
      <Space direction="vertical" style={{ width: "100%" }}>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Space>
    );
  }

  const isTotalZero = totalProducts === 0;

  return (
    <Card
      title="Thống kê trạng thái sản phẩm"
      extra={<Title level={5}>{`Tổng số sản phẩm: ${totalProducts}`}</Title>}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        {statistics.map((item) => (
          <Row
            key={item.status}
            align="middle"
            gutter={[16, 0]}
            style={{ width: "100%" }}
          >
            {/* Cột 1: Tên trạng thái và Số lượng/Tổng số */}
            <Col span={6}>
              <Text style={{ whiteSpace: "wrap" }}>
                <Text strong style={{ color: item.color }}>
                  {item.vietnameseName}: {item.number}
                </Text>
              </Text>
            </Col>

            {/* Cột 2: Thanh Progress */}
            <Col span={18}>
              <Progress
                style={{ width: "100%" }}
                percent={parseFloat(item.percent.toFixed(1))} // Làm tròn 1 chữ số thập phân
                size="small"
                strokeColor={item.color}
                showInfo={true}
              />
            </Col>
          </Row>
        ))}
      </Space>
    </Card>
  );
};

export default StatisticsProductStatus;
