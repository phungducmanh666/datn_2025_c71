"use client";

// Sử dụng React Icons thay vì Ant Design Icons (Tùy chọn, ở đây vẫn dùng Ant Design Icons cho tính đồng bộ)
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useCreatePaymentOrder } from "@hook/orderHook/paymentHook"; // Giữ nguyên hook
import { Alert, Button, Card, Divider, Spin, Typography } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const { Title, Paragraph, Text } = Typography;

const PaymentRedirectPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const orderUUID = params.slug as string;
  const status = searchParams.get("status");
  const isSuccess = status === "1"; // Kiểm tra trạng thái thành công

  const [countdown, setCountdown] = useState(10);

  const { mutate: createPaymentOrder, isPending: createPaymentLoading } =
    useCreatePaymentOrder(() => router.push(`/orders/${orderUUID}`));

  // Logic đếm ngược và gọi API (Giữ nguyên)
  useEffect(() => {
    if (isSuccess) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            createPaymentOrder(orderUUID);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isSuccess, orderUUID, createPaymentOrder]);

  const handleBackNow = () => {
    createPaymentOrder(orderUUID);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  // Hiển thị loading (Giữ nguyên)
  if (createPaymentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spin size="large" tip="Đang hoàn tất đơn hàng..." />
      </div>
    );
  }

  return (
    // Sử dụng Tailwind: min-h-screen (chiều cao tối thiểu), bg-gray-50 (màu nền), p-4 (padding)
    <div className="min-h-screen bg-gray-50 p-4 flex items-start justify-center pt-20 md:pt-28">
      {/* Sử dụng Tailwind cho kích thước tối đa và căn giữa */}
      <div className="w-full max-w-4xl">
        <Card
          bordered={false}
          // Tailwind: làm tròn góc (rounded-xl), đổ bóng (shadow-2xl), màu nền trắng (bg-white)
          className="rounded-xl shadow-2xl p-6 md:p-10 transition-all duration-300"
        >
          <div className="text-center">
            {/* --- Icon Lớn --- */}
            {isSuccess ? (
              // Tailwind: Kích thước icon (text-8xl), màu xanh lá (text-green-500), margin bottom (mb-6)
              <CheckCircleOutlined className="text-8xl text-green-500 mb-6" />
            ) : (
              // Tailwind: Màu đỏ (text-red-500)
              <CloseCircleOutlined className="text-8xl text-red-500 mb-6" />
            )}

            {/* --- Tiêu đề Chính --- */}
            <Title
              level={2}
              className={`${
                isSuccess ? "text-green-700" : "text-red-700"
              } font-extrabold mb-2`}
            >
              {isSuccess ? "THANH TOÁN THÀNH CÔNG" : "THANH TOÁN THẤT BẠI"}
            </Title>

            <Paragraph className="text-gray-600 text-lg mb-8">
              {isSuccess
                ? "Cảm ơn quý khách đã tin tưởng và mua sắm tại cửa hàng chúng tôi!"
                : "Đã xảy ra lỗi trong quá trình xử lý giao dịch. Vui lòng kiểm tra lại."}
            </Paragraph>

            <Divider className="my-6" />

            {/* --- Thông tin Chi tiết Đơn hàng --- */}
            {/* Tailwind: flex column, căn giữa (items-center), max-w-sm */}
            <div className="flex flex-col items-center max-w-sm mx-auto space-y-3 mb-8 text-left w-full">
              <Text strong className="text-base flex justify-between w-full">
                <span className="text-gray-500">Mã đơn hàng:</span>
                <Text copyable className="font-mono text-gray-800 ml-2">
                  {orderUUID}
                </Text>
              </Text>

              <Text strong className="text-base flex justify-between w-full">
                <span className="text-gray-500">Trạng thái:</span>
                <Text
                  type={isSuccess ? "success" : "danger"}
                  className="ml-2 font-semibold"
                >
                  {isSuccess ? "Hoàn tất" : "Không thành công"}
                </Text>
              </Text>
            </div>

            {/* --- Khu vực Đếm ngược/Lưu ý --- */}
            {isSuccess && countdown > 0 ? (
              <Alert
                type="info"
                showIcon
                message={
                  <Text>
                    Hệ thống sẽ tự động chuyển bạn về trang chi tiết đơn hàng
                    sau {/* Tailwind: text-xl, font-bold */}
                    <Text strong className="text-xl font-bold text-blue-600">
                      {countdown}
                    </Text>{" "}
                    giây.
                  </Text>
                }
                className="mb-8"
              />
            ) : !isSuccess ? (
              <Alert
                type="warning"
                showIcon
                message="Giao dịch không thành công."
                description="Vui lòng kiểm tra số dư, thông tin thanh toán hoặc thử lại. Nếu vấn đề tiếp diễn, hãy liên hệ bộ phận hỗ trợ của chúng tôi."
                className="mb-8"
              />
            ) : null}

            {/* --- Nút hành động --- */}
            {/* Tailwind: flex, gap-4, flex-wrap (trên mobile), căn giữa (justify-center) */}
            <div className="flex justify-center gap-4 flex-wrap mt-8">
              <Button
                icon={<HomeOutlined />}
                size="large"
                onClick={handleGoHome}
                className="h-12 px-6" // Tailwind-like height/padding for better button appearance
              >
                Tiếp tục mua sắm
              </Button>

              <Button
                type="primary"
                size="large"
                onClick={handleBackNow}
                disabled={createPaymentLoading}
                className="h-12 px-6 font-semibold"
              >
                {isSuccess ? "Xem chi tiết đơn hàng" : "Thử lại thanh toán"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentRedirectPage;
