import { ReviewData } from "@data/orderData";
import { Col, Progress, Row, Typography } from "antd";
import { useMemo } from "react";
import { FaStar } from "react-icons/fa"; // Icon ngôi sao từ react-icons

const { Title, Text } = Typography;

interface StarDistributionDetail {
  count: number;
  percentage: number;
}
interface StarDistributionMap {
  [key: number]: StarDistributionDetail; // { 5: { count: N, percentage: P }, ... }
}

const calculateStatistics = (reviews: ReviewData[]) => {
  if (!reviews || reviews.length === 0) {
    // ⭐ ĐÃ SỬA LỖI: Đảm bảo kiểu trả về là StarDistributionMap
    // Kiểu StarDistributionMap yêu cầu mỗi giá trị phải là StarDistributionDetail ({ count: number, percentage: number })
    const emptyDistribution: StarDistributionMap = {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    };

    return {
      averageRating: 0.0,
      totalReviews: 0,
      starDistribution: emptyDistribution, // Trả về StarDistributionMap (khắc phục lỗi TS)
    };
  }

  const totalReviews = reviews.length;
  let totalStarSum = 0;
  // Khởi tạo bộ đếm cho 5 mức sao
  const starCounts: { [key: number]: number } = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  reviews.forEach((review) => {
    const star = review.star;
    if (star >= 1 && star <= 5) {
      totalStarSum += star;
      starCounts[star] += 1;
    }
  });

  const averageRating = totalStarSum / totalReviews;
  const displayAverageRating = averageRating.toFixed(1);

  // Khai báo kiểu tường minh để đảm bảo đúng StarDistributionMap
  const starDistribution: StarDistributionMap = {};

  for (let star = 5; star >= 1; star--) {
    const count = starCounts[star] || 0;
    const percentage = (count / totalReviews) * 100;

    starDistribution[star] = {
      count: count,
      // Đảm bảo phần trăm không vượt quá 100 và làm tròn 1 chữ số thập phân
      percentage: Math.min(100, parseFloat(percentage.toFixed(1))),
    };
  }

  return {
    averageRating: parseFloat(displayAverageRating),
    totalReviews,
    starDistribution,
  };
};

interface ReviewStatisticsProps {
  data: ReviewData[];
}
const ReviewStatistics = ({ data }: ReviewStatisticsProps) => {
  // Dùng useMemo để chỉ tính toán lại thống kê khi mảng data thay đổi
  const statistics = useMemo(() => calculateStatistics(data), [data]);

  const { averageRating, totalReviews, starDistribution } = statistics;

  // Lấy màu vàng của Ant Design cho ngôi sao và màu xanh cho thanh tiến trình
  const starColor = "#FFC107";
  const activeBarColor = "#1890ff";
  // Số liệu "khách hài lòng" trong hình ảnh (9,1k) thường là số liệu marketing ngoài
  // Chúng ta sẽ dùng tổng số đánh giá để hiển thị, hoặc bạn có thể truyền thêm prop nếu cần
  const satisfiedDisplay = `${totalReviews.toLocaleString("en-US")}`;

  return (
    <Row gutter={[32, 16]} style={{ width: "100%" }}>
      {/* Cột Trái: Điểm TB và Tổng số */}
      <Col span={8} style={{ textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 5,
          }}
        >
          <FaStar size={30} color={starColor} />
          <Title
            level={2}
            style={{
              margin: 0,
              marginLeft: 8,
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {averageRating.toFixed(1)}
          </Title>
          <Text
            type="secondary"
            style={{ alignSelf: "flex-end", paddingBottom: "3px" }}
          >
            /5
          </Text>
        </div>

        <Text
          type="secondary"
          style={{ display: "block", fontSize: "14px", marginBottom: 2 }}
        >
          {satisfiedDisplay} khách hài lòng{" "}
          {/* Thay thế 9,1k bằng số lượng thực tế */}
        </Text>

        <Text
          type="secondary"
          style={{ display: "block", fontSize: "14px", color: "#8c8c8c" }}
        >
          {totalReviews} đánh giá
        </Text>
      </Col>

      {/* Cột Phải: Biểu đồ thanh */}
      <Col span={16}>
        {/* Lặp qua phân phối sao từ 5 xuống 1 */}
        {[5, 4, 3, 2, 1].map((star) => {
          // Lấy dữ liệu phân phối theo mức sao
          const distribution = starDistribution[star];
          // Tỉ lệ phần trăm hiển thị (ví dụ: 99.9%)
          const percentageText = `${distribution.percentage}%`;

          return (
            <Row
              key={star}
              align="middle"
              gutter={8}
              style={{ marginBottom: 4 }}
            >
              {/* Cột 1: Mức sao */}
              <Col
                span={3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Text style={{ marginRight: 4, fontWeight: "bold" }}>
                  {star}
                </Text>
                <FaStar size={12} color={starColor} />
              </Col>

              {/* Cột 2: Progress Bar */}
              <Col span={16}>
                <Progress
                  percent={distribution.percentage}
                  showInfo={false}
                  strokeColor={
                    distribution.percentage > 0 ? activeBarColor : "#f0f0f0"
                  }
                  trailColor="#f0f0f0"
                  size="small"
                />
              </Col>

              {/* Cột 3: Tỉ lệ phần trăm */}
              <Col span={5} style={{ textAlign: "right" }}>
                <Text style={{ fontSize: "14px", fontWeight: "500" }}>
                  {percentageText}
                </Text>
              </Col>
            </Row>
          );
        })}
      </Col>
    </Row>
  );
};

export default ReviewStatistics;
