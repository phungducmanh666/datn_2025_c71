"use client";

import { useLogin, useParserToken } from "@hook/userHook/authHook";
import { useCustomer } from "@hook/userHook/customerHook";
import { LocalStorageUtil } from "@util/localStorageUtil";
import { Button, Divider, Form, Input, Typography } from "antd"; // Import Divider để phân cách
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
// ⭐️ IMPORT REACT ICONS
import { AiOutlineLock, AiOutlineUser } from "react-icons/ai";
import { MdOutlineElectricalServices } from "react-icons/md";
// ⭐️ IMPORT ICON GOOGLE MỚI
import { useGetGoogleLoginUrl } from "@hook/userHook/google";
import { FcGoogle } from "react-icons/fc";

interface PageLoginProps {}

const { Link } = Typography;

const PageLogin: React.FC<PageLoginProps> = ({}) => {
  const router = useRouter();

  const [customerUUID, setCustomerUUID] = useState<string>();

  // State loading từ hook lấy thông tin nhân viên
  const { data: customer, isFetching: loadingCustomer } =
    useCustomer(customerUUID);

  useEffect(() => {
    if (!customer) return;
    LocalStorageUtil.setCustomer(customer);
    // Chuyển hướng sau khi lấy thông tin customer thành công
    router.push("/products");
  }, [customer, router]);

  // State loading từ hook phân tích token
  const { mutate: parserTokenMutate, isPending: parsering } = useParserToken(
    (info) => {
      LocalStorageUtil.setLoginInfo(info);
      setCustomerUUID(info.userUUID); // Kích hoạt useEffect lấy thông tin customer
    }
  );

  // State loading từ hook đăng nhập
  const { mutate: loginMutate, isPending: loging } = useLogin((token) => {
    LocalStorageUtil.setToken(token);
    parserTokenMutate(token); // Kích hoạt parser token
  });

  const onFinish = (values: any) => {
    const { username, password } = values;
    loginMutate({ username, password });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Gửi Form thất bại:", errorInfo);
  };

  // ⭐️ XÁC ĐỊNH TRẠNG THÁI LOADING CHUNG

  const { mutate: googleLoginMutate, isPending: googleLoginig } =
    useGetGoogleLoginUrl((url) => router.push(url));

  const handleGoogleLogin = () => {
    googleLoginMutate();
  };

  const isLoading = loging || parsering || loadingCustomer || googleLoginig;

  return (
    // ⭐️ Tailwind CSS: Nền xanh đậm, căn giữa, chiều cao toàn màn hình
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div
        className="
          max-w-sm w-full p-8 
          bg-white rounded-xl shadow-2xl 
          border-t-4 border-blue-600 
          transition duration-500 transform hover:scale-[1.01]
        "
      >
        <div className="flex flex-col items-center mb-6">
          {/* Icon/Logo phù hợp với ngành điện tử, làm nổi bật hơn */}
          <div className="p-3 bg-blue-100 rounded-full mb-3">
            <MdOutlineElectricalServices className="text-blue-600 text-4xl" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-800">
            HỆ THỐNG BÁN HÀNG
          </h2>
          <p className="text-gray-500 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* ⭐️ NÚT ĐĂNG NHẬP BẰNG GOOGLE */}
        <Button
          block
          size="large"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="
            mb-4 flex items-center justify-center 
            border border-gray-300 
            text-gray-700 font-medium 
            hover:border-blue-500 transition duration-300
          "
        >
          <FcGoogle className="text-xl mr-2" />
          Đăng nhập với Google
        </Button>

        {/* ⭐️ DẢI PHÂN CÁCH "HOẶC" */}
        <Divider className="!text-gray-400 !text-sm !my-6">HOẶC</Divider>

        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          {/* Trường Tên đăng nhập (Username) */}
          <Form.Item
            label={
              <span className="font-medium text-gray-700">Tên đăng nhập</span>
            } // Style label
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
            ]}
            className="mb-4"
          >
            {/* Thêm Icon vào Input */}
            <Input
              placeholder="Nhập tên đăng nhập của bạn"
              disabled={isLoading}
              prefix={
                <AiOutlineUser className="site-form-item-icon mr-2 text-gray-400" />
              }
              size="large"
              className="rounded-lg" // Bo góc input
            />
          </Form.Item>

          {/* Trường Mật khẩu (Password) */}
          <Form.Item
            label={<span className="font-medium text-gray-700">Mật khẩu</span>} // Style label
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
            className="mb-6"
          >
            {/* Thêm Icon vào Input */}
            <Input.Password
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              prefix={
                <AiOutlineLock className="site-form-item-icon mr-2 text-gray-400" />
              }
              size="large"
              className="rounded-lg" // Bo góc input
            />
          </Form.Item>

          {/* Nhóm các link chức năng */}
          <div className="flex justify-between mb-6">
            {/* Có thể thêm checkbox "Ghi nhớ" ở đây nếu cần */}
            <div className="flex-grow"></div>
            <Link
              href="/forgot-password"
              disabled={isLoading}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition duration-200"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Nút Đăng nhập */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isLoading}
              disabled={isLoading}
              // ⭐️ Tailwind: Thay đổi màu nút thành màu xanh đậm hơn, có hiệu ứng hover, thêm bo góc
              className="bg-blue-600 hover:!bg-blue-700 !border-blue-600 hover:!border-blue-700 shadow-lg shadow-blue-500/50 rounded-lg font-bold tracking-wider"
            >
              {isLoading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
            </Button>
          </Form.Item>

          {/* Link Đăng ký */}
          <div className="flex justify-center mt-6 text-center">
            <Typography.Text className="text-gray-600 mr-2">
              Chưa có tài khoản?
            </Typography.Text>
            <Link
              href="/register"
              disabled={isLoading}
              className="font-bold text-blue-600 hover:text-blue-700 transition duration-200"
            >
              Đăng ký ngay!
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default PageLogin;
